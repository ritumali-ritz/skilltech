/**
 * Database Setup Script
 * Helps set up the database with initial data
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        console.log('✅ Connected to MySQL');

        // Create database
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'skillhire_db'}`);
        console.log('✅ Database created/verified');

        // Use database
        await connection.execute(`USE ${process.env.DB_NAME || 'skillhire_db'}`);

        // Read and execute schema
        const fs = require('fs');
        const path = require('path');
        const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
        
        // Split by semicolons and execute each statement
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim() && !statement.trim().startsWith('--')) {
                try {
                    await connection.execute(statement);
                } catch (err) {
                    // Ignore errors for existing tables
                    if (!err.message.includes('already exists')) {
                        console.warn('Warning:', err.message);
                    }
                }
            }
        }

        console.log('✅ Schema imported');

        // Generate admin password hash
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminHash = await bcrypt.hash(adminPassword, 10);

        // Insert or update admin user
        await connection.execute(
            `INSERT INTO users (email, password, role, first_name, last_name, is_verified, is_active) 
             VALUES (?, ?, 'admin', 'Admin', 'User', TRUE, TRUE)
             ON DUPLICATE KEY UPDATE password = ?`,
            [process.env.ADMIN_EMAIL || 'admin@skillhire.com', adminHash, adminHash]
        );

        console.log('✅ Admin user created/updated');
        console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@skillhire.com'}`);
        console.log(`   Password: ${adminPassword}`);

        console.log('\n🎉 Database setup completed successfully!\n');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();

