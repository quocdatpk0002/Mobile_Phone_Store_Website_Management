const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    customerName: String,
    phoneNumber: String, 
    address: String,
    items: [{
        maSoDienThoai: String,
        tenDienThoai: String,
        gia: Number,
        soLuong: Number,
        imageUrl: String
    }],
    status: String
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
