/**
 * Applications Routes
 * Handle job applications, status updates, and tracking
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * POST /api/applications
 * Apply for a job (Job Seeker only)
 */
router.post('/', authenticate, authorize('job_seeker'), async (req, res) => {
    try {
        const { jobId, coverLetter } = req.body;
        const jobSeekerId = req.user.user_id;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }

        // Check if job exists and is active
        const [jobs] = await pool.execute(
            'SELECT job_id, status FROM jobs WHERE job_id = ?',
            [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (jobs[0].status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Job is not accepting applications'
            });
        }

        // Check if already applied
        const [existing] = await pool.execute(
            'SELECT application_id FROM applications WHERE job_id = ? AND job_seeker_id = ?',
            [jobId, jobSeekerId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        // Create application
        const [result] = await pool.execute(
            `INSERT INTO applications (job_id, job_seeker_id, cover_letter, status)
             VALUES (?, ?, ?, 'pending')`,
            [jobId, jobSeekerId, coverLetter || null]
        );

        // Update job applications count
        await pool.execute(
            'UPDATE jobs SET applications_count = applications_count + 1 WHERE job_id = ?',
            [jobId]
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: { applicationId: result.insertId }
        });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
});

/**
 * GET /api/applications/my-applications
 * Get all applications for current job seeker
 */
router.get('/my-applications', authenticate, authorize('job_seeker'), async (req, res) => {
    try {
        const jobSeekerId = req.user.user_id;

        const [applications] = await pool.execute(
            `SELECT a.*, 
                    j.job_title, j.job_type, j.category, j.location,
                    j.salary_min, j.salary_max,
                    c.company_name, c.logo as company_logo
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             LEFT JOIN companies c ON j.company_id = c.company_id
             WHERE a.job_seeker_id = ?
             ORDER BY a.applied_at DESC`,
            [jobSeekerId]
        );

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
});

/**
 * GET /api/applications/job/:jobId
 * Get all applications for a specific job (Employer only)
 */
router.get('/job/:jobId', authenticate, authorize('employer'), async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const employerId = req.user.user_id;

        // Verify job belongs to employer
        const [jobs] = await pool.execute(
            'SELECT job_id FROM jobs WHERE job_id = ? AND employer_id = ?',
            [jobId, employerId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or access denied'
            });
        }

        const [applications] = await pool.execute(
            `SELECT a.*, 
                    u.user_id, u.first_name, u.last_name, u.email, u.phone, u.profile_photo,
                    js.resume_path, js.bio, js.experience_years
             FROM applications a
             JOIN users u ON a.job_seeker_id = u.user_id
             LEFT JOIN job_seekers js ON u.user_id = js.user_id
             WHERE a.job_id = ?
             ORDER BY a.applied_at DESC`,
            [jobId]
        );

        // Get skills for each applicant
        for (let app of applications) {
            const [skills] = await pool.execute(
                `SELECT s.skill_id, s.skill_name, s.category, us.proficiency_level
                 FROM user_skills us
                 JOIN skills s ON us.skill_id = s.skill_id
                 WHERE us.user_id = ?`,
                [app.user_id]
            );
            app.skills = skills;
        }

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Get job applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
});

/**
 * PATCH /api/applications/:applicationId/status
 * Update application status (Employer only)
 */
router.patch('/:applicationId/status', authenticate, authorize('employer'), async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notes } = req.body;
        const employerId = req.user.user_id;

        if (!['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Verify application belongs to employer's job
        const [applications] = await pool.execute(
            `SELECT a.application_id 
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             WHERE a.application_id = ? AND j.employer_id = ?`,
            [applicationId, employerId]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or access denied'
            });
        }

        // Update status
        await pool.execute(
            `UPDATE applications 
             SET status = ?, notes = ?, reviewed_at = NOW()
             WHERE application_id = ?`,
            [status, notes || null, applicationId]
        );

        res.json({
            success: true,
            message: 'Application status updated'
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update application status',
            error: error.message
        });
    }
});

module.exports = router;

