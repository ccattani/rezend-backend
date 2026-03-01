/**
 * @openapi
 * /checks:
 *   post:
 *     tags: [Checks]
 *     summary: Cria cheque (OWNER)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckCreateRequest' }
 *     responses:
 *       201: { description: Criado }
 */

/**
 * @openapi
 * /checks/{id}/status:
 *   patch:
 *     tags: [Checks]
 *     summary: Atualiza status do cheque (OWNER)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckUpdateStatusRequest' }
 *     responses:
 *       200: { description: OK }
 */
const express = require('express')
const router = express.Router()

const { verifyToken, verifyRole } = require('../middleware/auth.middleware')
const checkController = require('../controllers/check.controller')
const { verifyPermission } = require('../middleware/permission.middleware')

router.post(
  '/',
  verifyToken,
  verifyPermission('CREATE_CHECK'),
  checkController.createCheck
)

router.patch(
  '/:id/status',
  verifyToken,
  verifyRole(['OWNER']),
  checkController.updateStatus
)

router.get(
  '/',
  verifyToken,
  verifyRole(['OWNER']),
  checkController.listChecks
)

module.exports = router