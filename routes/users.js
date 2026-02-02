/**
 * Users Routes
 * Handle user profiles, skills, and saved jobs
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    }
});

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [users] = await pool.execute(
            `SELECT user_id, email, role, first_name, last_name, phone, 
             profile_photo, is_verified, created_at 
             FROM users WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Get role-specific data
        if (user.role === 'job_seeker') {
            const [seekers] = await pool.execute(
                'SELECT * FROM job_seekers WHERE user_id = ?',
                [userId]
            );
            user.profile = seekers[0] || null;

            // Get skills
            const [skills] = await pool.execute(
                `SELECT s.skill_id, s.skill_name, s.category, us.proficiency_level, us.years_of_experience
                 FROM user_skills us
                 JOIN skills s ON us.skill_id = s.skill_id
                 WHERE us.user_id = ?`,
                [userId]
            );
            user.skills = skills;
        } else if (user.role === 'employer') {
            const [companies] = await pool.execute(
                'SELECT * FROM companies WHERE user_id = ?',
                [userId]
            );
            user.company = companies[0] || null;
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authenticate, upload.single('profilePhoto'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { firstName, lastName, phone, bio, currentPosition, experienceYears, educationLevel, location } = req.body;

        // Update basic user info
        if (firstName || lastName || phone) {
            const updateFields = [];
            const updateValues = [];

            if (firstName) {
                updateFields.push('first_name = ?');
                updateValues.push(firstName);
            }
            if (lastName) {
                updateFields.push('last_name = ?');
                updateValues.push(lastName);
            }
            if (phone) {
                updateFields.push('phone = ?');
                updateValues.push(phone);
            }
            if (req.file) {
                updateFields.push('profile_photo = ?');
                updateValues.push(req.file.filename);
            }

            if (updateFields.length > 0) {
                updateValues.push(userId);
                await pool.execute(
                    `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
                    updateValues
                );
            }
        }

        // Update role-specific profile
        if (req.user.role === 'job_seeker') {
            const updateFields = [];
            const updateValues = [];

            if (bio !== undefined) {
                updateFields.push('bio = ?');
                updateValues.push(bio);
            }
            if (currentPosition !== undefined) {
                updateFields.push('current_position = ?');
                updateValues.push(currentPosition);
            }
            if (experienceYears !== undefined) {
                updateFields.push('experience_years = ?');
                updateValues.push(experienceYears);
            }
            if (educationLevel !== undefined) {
                updateFields.push('education_level = ?');
                updateValues.push(educationLevel);
            }
            if (location !== undefined) {
                updateFields.push('location = ?');
                updateValues.push(location);
            }
            if (req.file && req.file.mimetype === 'application/pdf') {
                updateFields.push('resume_path = ?');
                updateValues.push(req.file.filename);
            }

            if (updateFields.length > 0) {
                updateValues.push(userId);
                await pool.execute(
                    `UPDATE job_seekers SET ${updateFields.join(', ')} WHERE user_id = ?`,
                    updateValues
                );
            }
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

/**
 * POST /api/users/skills
 * Add skill to user profile
 */
router.post('/skills', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { skillId, proficiencyLevel, yearsOfExperience } = req.body;

        if (!skillId) {
            return res.status(400).json({
                success: false,
                message: 'Skill ID is required'
            });
        }

        // Check if skill exists
        const [skills] = await pool.execute(
            'SELECT skill_id FROM skills WHERE skill_id = ?',
            [skillId]
        );

        if (skills.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        // Add or update user skill
        await pool.execute(
            `INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_of_experience)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             proficiency_level = VALUES(proficiency_level),
             years_of_experience = VALUES(years_of_experience)`,
            [userId, skillId, proficiencyLevel || 'intermediate', yearsOfExperience || 0]
        );

        res.json({
            success: true,
            message: 'Skill added successfully'
        });
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add skill',
            error: error.message
        });
    }
});

/**
 * DELETE /api/users/skills/:skillId
 * Remove skill from user profile
 */
router.delete('/skills/:skillId', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const skillId = req.params.skillId;

        await pool.execute(
            'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?',
            [userId, skillId]
        );

        res.json({
            success: true,
            message: 'Skill removed successfully'
        });
    } catch (error) {
        console.error('Remove skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove skill',
            error: error.message
        });
    }
});

/**
 * POST /api/users/saved-jobs
 * Save a job for later
 */
router.post('/saved-jobs', authenticate, authorize('job_seeker'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required'
            });
        }

        await pool.execute(
            'INSERT IGNORE INTO saved_jobs (job_id, job_seeker_id) VALUES (?, ?)',
            [jobId, userId]
        );

        res.json({
            success: true,
            message: 'Job saved successfully'
        });
    } catch (error) {
        console.error('Save job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save job',
            error: error.message
        });
    }
});

/**
 * GET /api/users/saved-jobs
 * Get all saved jobs
 */
router.get('/saved-jobs', authenticate, authorize('job_seeker'), async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [savedJobs] = await pool.execute(
            `SELECT j.*, 
                    c.company_name, c.logo as company_logo,
                    sj.saved_at
             FROM saved_jobs sj
             JOIN jobs j ON sj.job_id = j.job_id
             LEFT JOIN companies c ON j.company_id = c.company_id
             WHERE sj.job_seeker_id = ? AND j.status = 'active'
             ORDER BY sj.saved_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: savedJobs
        });
    } catch (error) {
        console.error('Get saved jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved jobs',
            error: error.message
        });
    }
});

/**
 * DELETE /api/users/saved-jobs/:jobId
 * Remove saved job
 */
router.delete('/saved-jobs/:jobId', authenticate, authorize('job_seeker'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const jobId = req.params.jobId;

        await pool.execute(
            'DELETE FROM saved_jobs WHERE job_id = ? AND job_seeker_id = ?',
            [jobId, userId]
        );

        res.json({
            success: true,
            message: 'Job removed from saved list'
        });
    } catch (error) {
        console.error('Remove saved job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove saved job',
            error: error.message
        });
    }
});

module.exports = router;

