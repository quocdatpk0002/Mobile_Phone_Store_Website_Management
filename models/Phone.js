const mongoose = require('mongoose');

const PhoneSchema = new mongoose.Schema({
    maSoDienThoai: { type: String, unique: true },
    tenDienThoai: String,
    hangDienThoai: String,
    thongtincoban: String,
    gia: Number,
    imageUrl: String,
});

const Phone = mongoose.model('Phone', PhoneSchema);

module.exports = Phone;
