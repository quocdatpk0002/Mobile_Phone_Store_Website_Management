const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createAdminUser() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'a@123456', 
        port: 3306,
        database: 'bt_big_manageaccount' 
    });

    const username = "admin1";
    const password = "admin1";
    const role = "admin";
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [rows] = await connection.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );
        console.log('Admin user created successfully: ', rows);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await connection.end();
    }
}

createAdminUser();
