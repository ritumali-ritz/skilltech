/**
 * Authentication Middleware
 * JWT-based authentication and role-based access control
 */

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
        
        // Get user from database
        const [users] = await pool.execute(
            'SELECT user_id, email, role, first_name, last_name, is_active FROM users WHERE user_id = ?',
            [decoded.userId]
        );

        if (users.length === 0 || !users[0].is_active) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or inactive user' 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Authentication error' 
        });
    }
};

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Insufficient permissions' 
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };

