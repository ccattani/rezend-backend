/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Cria um usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserResponse' }
 *       400:
 *         description: Erro
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Resgiter,Login e retorna JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200:
 *         description: Token JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenResponse' }
 *       400:
 *         description: Erro
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { verifyToken, verifyRole } = require('../middleware/auth.middleware')
const { verifyPermission } = require('../middleware/permission.middleware')

router.post('/register', verifyToken, verifyRole(['CHEFE']), authController.register)
router.post('/login', authController.login)
router.get('/me', verifyToken, authController.me)

module.exports = router