/**
 * Admin Routes
 * Handle admin operations: user management, job approval, analytics
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * GET /api/admin/analytics
 * Get platform analytics
 */
router.get('/analytics', authenticate, authorize('admin'), async (req, res) => {
    try {
        // Get total counts
        const [userCount] = await pool.execute(
            'SELECT COUNT(*) as total, role FROM users WHERE is_active = 1 GROUP BY role'
        );

        const [jobCount] = await pool.execute(
            'SELECT COUNT(*) as total, status FROM jobs GROUP BY status'
        );

        const [applicationCount] = await pool.execute(
            'SELECT COUNT(*) as total, status FROM applications GROUP BY status'
        );

        // Get recent activity
        const [recentJobs] = await pool.execute(
            `SELECT COUNT(*) as count, DATE(created_at) as date 
             FROM jobs 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date DESC`
        );

        const [recentUsers] = await pool.execute(
            `SELECT COUNT(*) as count, DATE(created_at) as date 
             FROM users 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date DESC`
        );

        res.json({
            success: true,
            data: {
                users: userCount,
                jobs: jobCount,
                applications: applicationCount,
                recentJobs,
                recentUsers
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT user_id, email, role, first_name, last_name, is_active, created_at FROM users WHERE 1=1';
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (search) {
            query += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [users] = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];
        if (role) {
            countQuery += ' AND role = ?';
            countParams.push(role);
        }
        if (search) {
            countQuery += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }

        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

/**
 * PATCH /api/admin/users/:userId/status
 * Activate or deactivate user
 */
router.patch('/users/:userId/status', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        await pool.execute(
            'UPDATE users SET is_active = ? WHERE user_id = ?',
            [isActive ? 1 : 0, userId]
        );

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/jobs
 * Get all jobs with filters
 */
router.get('/jobs', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `
            SELECT j.*, u.first_name, u.last_name, c.company_name
            FROM jobs j
            LEFT JOIN users u ON j.employer_id = u.user_id
            LEFT JOIN companies c ON j.company_id = c.company_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND j.status = ?';
            params.push(status);
        }

        query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [jobs] = await pool.query(query, params);

        res.json({
            success: true,
            data: jobs
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
 * PATCH /api/admin/jobs/:jobId/status
 * Approve or reject job posting
 */
router.patch('/jobs/:jobId/status', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.body;

        if (!['pending', 'active', 'rejected', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await pool.execute(
            'UPDATE jobs SET status = ? WHERE job_id = ?',
            [status, jobId]
        );

        // Log admin action
        await pool.execute(
            `INSERT INTO admin_logs (admin_id, action_type, target_type, target_id, description)
             VALUES (?, ?, ?, ?, ?)`,
            [
                req.user.user_id,
                'update_job_status',
                'job',
                jobId,
                `Changed job status to ${status}`
            ]
        );

        res.json({
            success: true,
            message: 'Job status updated successfully'
        });
    } catch (error) {
        console.error('Update job status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update job status',
            error: error.message
        });
    }
});

/**
 * DELETE /api/admin/jobs/:jobId
 * Delete a job posting
 */
router.delete('/jobs/:jobId', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { jobId } = req.params;

        await pool.execute('DELETE FROM jobs WHERE job_id = ?', [jobId]);

        // Log admin action
        await pool.execute(
            `INSERT INTO admin_logs (admin_id, action_type, target_type, target_id, description)
             VALUES (?, ?, ?, ?, ?)`,
            [
                req.user.user_id,
                'delete_job',
                'job',
                jobId,
                'Deleted job posting'
            ]
        );

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete job',
            error: error.message
        });
    }
});

module.exports = router;

