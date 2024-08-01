const Phone = require('../models/Phone');
const multer = require('multer');
const Payment = require('../models/Payment');

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) { 
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }); 

exports.addPhone = async (req, res) => {
    try {
        const existingPhone = await Phone.findOne({ maSoDienThoai: req.body.maSoDienThoai });
        if (existingPhone) {
            return res.status(400).send({ message: 'Mã số điện thoại đã tồn tại' });
        }

        const upload = req.file ? '/uploads/' + req.file.filename : null;
        const newPhone = new Phone({
            maSoDienThoai: req.body.maSoDienThoai,
            tenDienThoai: req.body.tenDienThoai,
            hangDienThoai: req.body.hangDienThoai,
            thongtincoban: req.body.thongtincoban,
            gia: req.body.gia,
            imageUrl: upload 
        });

        await newPhone.save();
        res.status(201).send({
            message: "Đã thêm điện thoại thành công!",
            phone: newPhone
        });
    } catch (err) {
        console.error(err); 
        res.status(500).send({ message: 'Lỗi khi thêm điện thoại mới', error: err.message });
    }
};

exports.updatePhone = async (req, res) => {
    const maSoDienThoai = req.params.maSoDienThoai;
    const updateData = req.body; 

    try {
        const phone = await Phone.findOne({ maSoDienThoai: maSoDienThoai });
        if (!phone) {
            return res.status(404).send({ message: 'Mã số điện thoại không tồn tại' });
        }

        if (updateData.tenDienThoai) phone.tenDienThoai = updateData.tenDienThoai;
        if (updateData.hangDienThoai) phone.hangDienThoai = updateData.hangDienThoai;
        if (updateData.thongtincoban) phone.thongtincoban = updateData.thongtincoban;
        if (updateData.gia) phone.gia = updateData.gia;
        if (req.file) {
            phone.imageUrl = '/uploads/' + req.file.filename;
        }

        await phone.save();
        res.send(phone);
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi cập nhật thông tin điện thoại', error: err.message });
    }
    console.log(req.body);
    if (req.file) {
        console.log('Đã nhận được tệp:', req.file.filename);
    }
};

exports.deletePhone = async (req, res) => {
    const maSoDienThoai = req.params.maSoDienThoai;

    try {
        const phone = await Phone.findOne({ maSoDienThoai: maSoDienThoai });
        if (!phone) {
            return res.status(404).send({ message: 'Mã số điện thoại không tồn tại' });
        }

        await Phone.deleteOne({ maSoDienThoai: maSoDienThoai });
        res.send({ message: 'Điện thoại đã được xóa' });
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi xóa điện thoại' });
    }
};

exports.searchPhone = async (req, res) => {
    try {
        const maSoDienThoai = req.params.maSoDienThoai;
        const phones = await Phone.find({ maSoDienThoai: { $regex: maSoDienThoai, $options: 'i' } });

        if (!phones.length) {
            return res.status(404).send({ message: 'Không tìm thấy điện thoại nào' });
        }

        res.send(phones);
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi tìm kiếm điện thoại' });
    }
};

exports.getAllPhones = async (req, res) => {
    try {
        const phones = await Phone.find({});
        res.send(phones);
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi lấy dữ liệu điện thoại' });
    }
};

// Lấy thông tin điện thoại theo mã số
exports.getPhone = async (req, res) => {
    try {
        const phone = await Phone.findOne({ maSoDienThoai: req.params.maSoDienThoai });
        if (!phone) {
            return res.status(404).send({ message: 'Mã số điện thoại không tồn tại' });
        }
        res.render('phoneDetail', { phone: phone }); 
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi tìm kiếm điện thoại' });
    }
};

// Cập nhật route thêm vào giỏ hàng để cho phép thêm số lượng
exports.addToCart = async (req, res) => {
    const phoneId = req.params.maSoDienThoai;
    try {
        const phone = await Phone.findOne({ maSoDienThoai: phoneId });
        if (!phone) {
            return res.status(404).send({ message: 'Sản phẩm không tồn tại' });
        }
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Tìm sản phẩm trong giỏ hàng
        let itemIndex = req.session.cart.findIndex(item => item.maSoDienThoai === phoneId);

        if (itemIndex > -1) {
            req.session.cart[itemIndex].soLuong += 1;
        } else {
            req.session.cart.push({
                maSoDienThoai: phone.maSoDienThoai,
                tenDienThoai: phone.tenDienThoai,
                gia: phone.gia,
                imageUrl: phone.imageUrl,
                soLuong: 1
            });
        }
        res.status(200).send({ message: 'Thêm vào giỏ hàng thành công' });
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi thêm vào giỏ hàng', error: err.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = (req, res) => {
    const phoneId = req.params.maSoDienThoai;
    if (req.session.cart) {
        let itemIndex = req.session.cart.findIndex(item => item.maSoDienThoai === phoneId);
        if (itemIndex > -1) {
            req.session.cart.splice(itemIndex, 1);
            res.status(200).send({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng' });
        } else {
            res.status(404).send({ message: 'Sản phẩm không tìm thấy trong giỏ hàng' });
        }
    } else {
        res.status(400).send({ message: 'Giỏ hàng trống' });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = (req, res) => {
    const phoneId = req.params.maSoDienThoai;
    const { newQuantity } = req.body; // Số lượng mới được gửi từ client

    if (req.session.cart) {
        let itemIndex = req.session.cart.findIndex(item => item.maSoDienThoai === phoneId);
        if (itemIndex > -1) {
            // Cập nhật số lượng nếu tìm thấy sản phẩm 
            req.session.cart[itemIndex].soLuong = newQuantity;
            res.status(200).send({ message: 'Cập nhật số lượng thành công' });
        } else {
            res.status(404).send({ message: 'Sản phẩm không tìm thấy trong giỏ hàng' });
        }
    } else {
        res.status(400).send({ message: 'Giỏ hàng trống' });
    }
};

exports.handleCheckout = async (req, res) => {
    const { customerName, phoneNumber, address } = req.body;
    const cartItems = req.session.cart || [];

    try {
        const newPayment = new Payment({
            customerName,
            phoneNumber,
            address,
            items: cartItems,
            status: 'Pending'
        });

        await newPayment.save();

        // Thêm dữ liệu về trạng thái thanh toán vào session
        req.session.paymentStatus = { success: true, message: "Thanh toán thành công!" };

        // Trả về trang cart với thông tin trạng thái thanh toán
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        req.session.paymentStatus = { success: false, message: "Lỗi khi xử lý thanh toán!" };
        res.redirect('/cart');
    }
};

//Sản phẩm theo hãng
exports.getIphones = async (req, res) => {
    try {
        const iphones = await Phone.find({ hangDienThoai: 'Iphone' });
        res.render('phoneList', { phones: iphones }); 
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi lấy dữ liệu điện thoại', error: err.message });
    }
};

exports.getSamsungs = async (req, res) => {
    try {
        const samsungs = await Phone.find({ hangDienThoai: 'SamSung' });
        res.render('phoneList', { phones: samsungs }); 
    } catch (err) {
        res.status(500).send({ message: 'Lỗi khi lấy dữ liệu điện thoại', error: err.message });
    }
};
