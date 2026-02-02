/**
 * Generate Admin Password Hash
 * Run this script to generate a bcrypt hash for admin password
 * Usage: node scripts/generate-admin-hash.js [password]
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10)
    .then(hash => {
        console.log('\n========================================');
        console.log('Admin Password Hash Generator');
        console.log('========================================\n');
        console.log('Password:', password);
        console.log('Hash:', hash);
        console.log('\nSQL Update Command:');
        console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@skillhire.com';\n`);
    })
    .catch(err => {
        console.error('Error generating hash:', err);
    });

