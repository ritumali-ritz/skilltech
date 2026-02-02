/**
 * Skills Routes
 * Handle skill management and categories
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /api/skills
 * Get all skills with optional category filter
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;

        let query = 'SELECT * FROM skills';
        const params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY category, skill_name';

        const [skills] = await pool.execute(query, params);

        res.json({
            success: true,
            data: skills
        });
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch skills',
            error: error.message
        });
    }
});

/**
 * GET /api/skills/categories
 * Get all skill categories
 */
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category'
        );

        res.json({
            success: true,
            data: categories.map(c => c.category)
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
});

module.exports = router;

