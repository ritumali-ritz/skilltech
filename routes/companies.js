/**
 * Companies Routes
 * Handle company profile management
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for logo uploads
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
        cb(null, 'company-logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2097152 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});

/**
 * GET /api/companies/my-company
 * Get current employer's company profile
 */
router.get('/my-company', authenticate, authorize('employer'), async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [companies] = await pool.execute(
            'SELECT * FROM companies WHERE user_id = ?',
            [userId]
        );

        if (companies.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No company profile found'
            });
        }

        res.json({
            success: true,
            data: companies[0]
        });
    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company profile',
            error: error.message
        });
    }
});

/**
 * POST /api/companies
 * Create or update company profile
 */
router.post('/', authenticate, authorize('employer'), upload.single('logo'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const {
            companyName,
            companyDescription,
            industry,
            website,
            location,
            employeeCount,
            foundedYear
        } = req.body;

        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required'
            });
        }

        // Check if company already exists
        const [existing] = await pool.execute(
            'SELECT company_id FROM companies WHERE user_id = ?',
            [userId]
        );

        if (existing.length > 0) {
            // Update existing company
            const updateFields = ['company_name = ?'];
            const updateValues = [companyName];

            if (companyDescription) {
                updateFields.push('company_description = ?');
                updateValues.push(companyDescription);
            }
            if (industry) {
                updateFields.push('industry = ?');
                updateValues.push(industry);
            }
            if (website) {
                updateFields.push('website = ?');
                updateValues.push(website);
            }
            if (location) {
                updateFields.push('location = ?');
                updateValues.push(location);
            }
            if (employeeCount) {
                updateFields.push('employee_count = ?');
                updateValues.push(employeeCount);
            }
            if (foundedYear) {
                updateFields.push('founded_year = ?');
                updateValues.push(foundedYear);
            }
            if (req.file) {
                updateFields.push('logo = ?');
                updateValues.push(req.file.filename);
            }

            updateValues.push(userId);

            await pool.execute(
                `UPDATE companies SET ${updateFields.join(', ')} WHERE user_id = ?`,
                updateValues
            );

            res.json({
                success: true,
                message: 'Company profile updated successfully'
            });
        } else {
            // Create new company
            const [result] = await pool.execute(
                `INSERT INTO companies (
                    user_id, company_name, company_description, industry,
                    website, logo, location, employee_count, founded_year
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, companyName, companyDescription || null, industry || null,
                    website || null, req.file ? req.file.filename : null,
                    location || null, employeeCount || null, foundedYear || null
                ]
            );

            res.status(201).json({
                success: true,
                message: 'Company profile created successfully',
                data: { companyId: result.insertId }
            });
        }
    } catch (error) {
        console.error('Create/update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save company profile',
            error: error.message
        });
    }
});

module.exports = router;

