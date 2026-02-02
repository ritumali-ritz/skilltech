const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const newHash = await bcrypt.hash('admin123', 10);
    await connection.execute('UPDATE users SET password = ? WHERE email = ?', [newHash, 'admin@skillhire.com']);
    console.log('Admin password has been reset to: admin123');
    await connection.end();
}

resetAdmin().catch(console.error);
