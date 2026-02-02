const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await connection.execute('SELECT email, role, is_active FROM users');
    console.log('--- USERS IN DATABASE ---');
    console.table(rows);
    await connection.end();
}

checkUsers().catch(console.error);
