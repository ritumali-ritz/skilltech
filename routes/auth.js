/**
 * Authentication Routes
 * Handles user registration, login, and session management
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { hashPassword, comparePassword, generateToken, isValidEmail } = require('../utils/helpers');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user (Job Seeker or Employer)
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, phone } = req.body;

        // Validation
        if (!email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        if (!['job_seeker', 'employer'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const [result] = await pool.execute(
            `INSERT INTO users (email, password, role, first_name, last_name, phone) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [email, hashedPassword, role, firstName, lastName, phone || null]
        );

        const userId = result.insertId;

        // Create role-specific profile
        if (role === 'job_seeker') {
            await pool.execute(
                'INSERT INTO job_seekers (user_id) VALUES (?)',
                [userId]
            );
        } else if (role === 'employer') {
            // Employer profile will be created when they add company info
        }

        // Generate token
        const token = generateToken(userId, role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId,
                email,
                role,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Get user from database
        const [users] = await pool.execute(
            'SELECT user_id, email, password, role, first_name, last_name, is_active FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user.user_id, user.role);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.user_id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Get user details
        const [users] = await pool.execute(
            `SELECT user_id, email, role, first_name, last_name, phone, profile_photo, 
             is_verified, created_at FROM users WHERE user_id = ?`,
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
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user info',
            error: error.message
        });
    }
});

module.exports = router;

