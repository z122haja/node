const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    // 指定导入文件存储位置
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../../dist/excel'))
    },
    // 指定文件名
    filename(req, file, cb) {
        cb(null, Date.now() + Math.random().toString(16) + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

module.exports = upload