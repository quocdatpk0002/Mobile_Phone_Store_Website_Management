const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');
const upload = require('../middleware/multer-config');


router.get('/phones/:maSoDienThoai', phoneController.getPhone);

router.put('/phones/:maSoDienThoai', upload.single('phoneImage'), phoneController.updatePhone);

router.delete('/phones/:maSoDienThoai', phoneController.deletePhone);

router.get('/phones/search/:maSoDienThoai', phoneController.searchPhone);

router.post('/phones', upload.single('phoneImage'), phoneController.addPhone);

router.get('/phones', phoneController.getAllPhones);


router.get('/phones/addToCart/:maSoDienThoai', phoneController.addToCart);

router.get('/phones/removeFromCart/:maSoDienThoai', phoneController.removeFromCart);

router.post('/phones/updateCartItem/:maSoDienThoai', phoneController.updateCartItem);

router.post('/phones/checkout', phoneController.handleCheckout);

router.get('/phones/brand/iphone', phoneController.getIphones);
router.get('/phones/brand/samsung', phoneController.getSamsungs);

module.exports = router;
