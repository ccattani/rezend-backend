const multer = require('multer')
const path = require('path')

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido (apenas PDF/JPG/PNG)'), false)
  }
  cb(null, true)
}

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // <= 4MB pra não bater no limite 4.5MB do Vercel
  fileFilter
})