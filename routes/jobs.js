/**
 * Jobs Routes
 * Handle job posting, searching, filtering, and management
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateSkillMatch } = require('../utils/helpers');

/**
 * GET /api/jobs
 * Get all active jobs with filters and pagination
 */
router.get('/', async (req, res) => {
    try {
        const {
            category,
            jobType,
            location,
            search,
            minSalary,
            page = 1,
            limit = 10
        } = req.query;

        let query = `
            SELECT j.*, 
                   u.first_name, u.last_name,
                   c.company_name, c.logo as company_logo
            FROM jobs j
            LEFT JOIN users u ON j.employer_id = u.user_id
            LEFT JOIN companies c ON j.company_id = c.company_id
            WHERE j.status = 'active'
        `;
        const params = [];

        // Apply filters
        if (category) {
            query += ' AND j.category = ?';
            params.push(category);
        }

        if (jobType) {
            query += ' AND j.job_type = ?';
            params.push(jobType);
        }

        if (location) {
            query += ' AND j.location LIKE ?';
            params.push(`%${location}%`);
        }

        if (search) {
            query += ' AND (j.job_title LIKE ? OR j.job_description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (minSalary) {
            query += ' AND j.salary_min >= ?';
            params.push(minSalary);
        }

        // Order by posted date
        query += ' ORDER BY j.posted_at DESC';

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [jobs] = await pool.query(query, params);

        // Get skills for each job
        for (let job of jobs) {
            const [skills] = await pool.execute(
                `SELECT s.skill_id, s.skill_name, s.category 
                 FROM job_skills js
                 JOIN skills s ON js.skill_id = s.skill_id
                 WHERE js.job_id = ?`,
                [job.job_id]
            );
            job.skills = skills;
        }

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM jobs WHERE status = "active"';
        const countParams = [];

        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }
        if (jobType) {
            countQuery += ' AND job_type = ?';
            countParams.push(jobType);
        }
        if (location) {
            countQuery += ' AND location LIKE ?';
            countParams.push(`%${location}%`);
        }
        if (search) {
            countQuery += ' AND (job_title LIKE ? OR job_description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs',
            error: error.message
        });
    }
});

/**
 * GET /api/jobs/:id
 * Get single job details with skills
 */
router.get('/:id', async (req, res) => {
    try {
        const jobId = req.params.id;

        const [jobs] = await pool.execute(
            `SELECT j.*, 
                    u.first_name, u.last_name, u.email,
                    c.*
             FROM jobs j
             LEFT JOIN users u ON j.employer_id = u.user_id
             LEFT JOIN companies c ON j.company_id = c.company_id
             WHERE j.job_id = ?`,
            [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const job = jobs[0];

        // Get required skills
        const [skills] = await pool.execute(
            `SELECT s.skill_id, s.skill_name, s.category, js.is_required
             FROM job_skills js
             JOIN skills s ON js.skill_id = s.skill_id
             WHERE js.job_id = ?`,
            [jobId]
        );
        job.skills = skills;

        // Increment view count
        await pool.execute(
            'UPDATE jobs SET views_count = views_count + 1 WHERE job_id = ?',
            [jobId]
        );

        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch job',
            error: error.message
        });
    }
});

/**
 * POST /api/jobs
 * Create a new job posting (Employer only)
 */
router.post('/', authenticate, authorize('employer'), async (req, res) => {
    try {
        const {
            jobTitle,
            jobDescription,
            jobType,
            category,
            location,
            salaryMin,
            salaryMax,
            salaryCurrency,
            experienceRequired,
            educationRequired,
            skillIds,
            expiresAt
        } = req.body;

        if (!jobTitle || !jobDescription || !jobType || !category) {
            return res.status(400).json({
                success: false,
                message: 'Job title, description, type, and category are required'
            });
        }

        const employerId = req.user.user_id;

        // Get company_id for this employer
        const [companies] = await pool.execute(
            'SELECT company_id FROM companies WHERE user_id = ?',
            [employerId]
        );
        const companyId = companies.length > 0 ? companies[0].company_id : null;

        // Create job
        const [result] = await pool.execute(
            `INSERT INTO jobs (
                employer_id, company_id, job_title, job_description, job_type,
                category, location, salary_min, salary_max, salary_currency,
                experience_required, education_required, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                employerId, companyId, jobTitle, jobDescription, jobType,
                category, location || null, salaryMin || null, salaryMax || null,
                salaryCurrency || 'INR', experienceRequired || 0, educationRequired || null,
                expiresAt || null
            ]
        );

        const jobId = result.insertId;

        // Add skills to job
        if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
            const skillValues = skillIds.map(skillId => [jobId, skillId]);
            await pool.query(
                'INSERT INTO job_skills (job_id, skill_id) VALUES ?',
                [skillValues]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: { jobId }
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create job',
            error: error.message
        });
    }
});

/**
 * GET /api/jobs/recommended/:userId
 * Get skill-based job recommendations for a job seeker
 */
router.get('/recommended/:userId', authenticate, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (req.user.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get user skills
        const [userSkills] = await pool.execute(
            `SELECT skill_id FROM user_skills WHERE user_id = ?`,
            [userId]
        );

        if (userSkills.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No skills found. Add skills to get recommendations.'
            });
        }

        const userSkillIds = userSkills.map(s => s.skill_id);

        // Get all active jobs with their skills
        const [jobs] = await pool.execute(
            `SELECT j.*, 
                    c.company_name, c.logo as company_logo
             FROM jobs j
             LEFT JOIN companies c ON j.company_id = c.company_id
             WHERE j.status = 'active'
             ORDER BY j.posted_at DESC
             LIMIT 50`
        );

        // Calculate match score for each job
        const jobsWithMatch = await Promise.all(jobs.map(async (job) => {
            const [jobSkills] = await pool.execute(
                `SELECT skill_id FROM job_skills WHERE job_id = ?`,
                [job.job_id]
            );

            const matchScore = calculateSkillMatch(
                userSkills,
                jobSkills
            );

            return {
                ...job,
                matchScore,
                skills: jobSkills.map(js => js.skill_id)
            };
        }));

        // Sort by match score (highest first)
        jobsWithMatch.sort((a, b) => b.matchScore - a.matchScore);

        // Get top 10 recommendations
        const recommendations = jobsWithMatch.slice(0, 10);

        // Get full skill details for recommendations
        for (let job of recommendations) {
            const [skills] = await pool.execute(
                `SELECT s.skill_id, s.skill_name, s.category 
                 FROM job_skills js
                 JOIN skills s ON js.skill_id = s.skill_id
                 WHERE js.job_id = ?`,
                [job.job_id]
            );
            job.skills = skills;
        }

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations',
            error: error.message
        });
    }
});

module.exports = router;

