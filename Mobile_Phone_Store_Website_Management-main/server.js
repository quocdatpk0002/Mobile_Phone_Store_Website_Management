const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');
const phoneRoutes = require('./routes/phoneRoutes');
const userRoutes = require('./routes/userRoutes');
const axios = require('axios');
const app = express();
const port = 8083;
const session = require('express-session');
const Payment = require('./models/Payment');

// Thiết lập session, quản lý tình trạng đăng nhap của người dùng
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const mongoDB = 'mongodb://localhost:27017/phone_manage';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const dbMongo = mongoose.connection;
dbMongo.on('error', console.error.bind(console, 'MongoDB connection error:'));

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'a@123456',
    port: 3306,
    database: 'bt_big_manageaccount'
};

// Middleware để kết nối cơ sở dữ liệu MySQL
app.use(async (req, res, next) => {
    if (!global.connection || global.connection.state === 'disconnected') {
        global.connection = await mysql.createConnection(dbConfig);
    }
    req.connection = global.connection;
    next();
});

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.set('view engine', 'ejs'); 
app.use('/uploads', express.static('uploads'));

app.use('/api', userRoutes);
app.use('/api', phoneRoutes);

app.get('/', (req, res) => {
    res.redirect('/home'); 
});

app.get('/home', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8083/api/phones'); 
        const phones = response.data;
        res.render('home', { phones: phones }); 
    } catch (error) {
        console.error(error);
        res.send('Lỗi khi lấy dữ liệu điện thoại');
    }
});

app.get('/logout', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8083/api/phones'); 
        const phones = response.data;
        res.render('logout', { phones: phones, user: req.session.user }); 
    } catch (error) {
        console.error(error);
        res.send('Lỗi khi lấy dữ liệu điện thoại');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/index3', (req, res) => {
    res.render('index3');
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/logout', (req, res) => {
    res.render('logout');
});

// Route cần xác thực người dùng
app.get('/protected-route', authMiddleware, (req, res) => {
    // Người dùng đã xác thực có thể truy cập route này
    res.send(`Welcome, your user id is: ${req.user.id}`);
});

app.get('/cart', (req, res) => {
    const paymentStatus = req.session.paymentStatus || null;
    if (paymentStatus) {
        req.session.paymentStatus = null; // Xóa sau khi đã lấy để gửi đến view
    }
    res.render('cart', {
        cart: req.session.cart || [],
        paymentStatus: paymentStatus
    });
});

app.get('/care', function (req, res) {
    res.render('care');
});

app.get('/security', function (req, res) {
    res.render('security');
});

app.get('/repair', function (req, res) {
    res.render('repair');
});

// API endpoint để lấy tất cả thông tin đơn hàng
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await Payment.find({});
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payment data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

