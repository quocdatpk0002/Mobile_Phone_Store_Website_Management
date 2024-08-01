const multer = require('multer');

// Cấu hình storage engine của multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Cấu hình multer với storage engine đã định nghĩa ở trên
const upload = multer({ storage: storage });

module.exports = upload;