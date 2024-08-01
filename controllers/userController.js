const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = 'thuong@123456'; 

exports.register = async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // truy vấn 
    try {
        const [rows] = await req.connection.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );
        res.status(201).json({ message: 'User registered', userId: rows.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await req.connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0]; 

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            secretKey,
            { expiresIn: '24h' }
        );

        // Lưu thông tin người dùng vào session 
        req.session.user = { userId: user.id, username: user.username, role: user.role };

        res.json({ message: 'Login successful', token: token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
