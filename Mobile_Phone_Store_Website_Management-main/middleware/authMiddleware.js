const jwt = require('jsonwebtoken');

// Khóa bí mật được sử dụng để ký và xác minh JWT.
const SECRET_KEY = 'thuong@123456';

const authMiddleware = (req, res, next) => {
    try {
        // Lấy token từ header Authorization. Định dạng là "Bearer <token>"
        const token = req.headers.authorization.split(' ')[1]; 

        // Kiểm tra xem token có tồn tại không
        if (!token) {
            return res.status(401).send({ message: 'Access denied. No token provided.' });
        }

        // Xác minh token và lấy thông tin người dùng từ token
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;

        next();
    } catch (error) {
        res.status(400).send({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
