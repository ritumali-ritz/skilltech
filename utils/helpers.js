/**
 * Helper Functions
 * Utility functions used throughout the application
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key',
        { expiresIn: '7d' }
    );
};

/**
 * Calculate skill match percentage between user and job
 */
const calculateSkillMatch = (userSkills, jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return 0;
    if (!userSkills || userSkills.length === 0) return 0;

    const userSkillIds = new Set(userSkills.map(s => s.skill_id));
    const jobSkillIds = new Set(jobSkills.map(s => s.skill_id));
    
    let matched = 0;
    jobSkillIds.forEach(skillId => {
        if (userSkillIds.has(skillId)) matched++;
    });

    return Math.round((matched / jobSkillIds.size) * 100);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    calculateSkillMatch,
    isValidEmail,
    sanitizeInput
};

