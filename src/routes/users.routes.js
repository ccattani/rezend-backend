const express = require('express')
const router = express.Router()
const usersController = require('../controllers/users.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { verifyPermission } = require('../middleware/permission.middleware')

// admin (ou quem tiver permissão) cria usuários
router.post('/', verifyToken, verifyPermission('CREATE_USER'), usersController.createUser)

module.exports = router