/**
 * @openapi
 * /audit:
 *   get:
 *     tags: [Audit]
 *     summary: Lista logs de auditoria (OWNER)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: entity
 *         schema: { type: string }
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: take
 *         schema: { type: integer, example: 50 }
 *     responses:
 *       200: { description: OK }
 */
const express = require('express')
const router = express.Router()

const { verifyToken } = require('../middleware/auth.middleware')
const { verifyPermission } = require('../middleware/permission.middleware')
const auditController = require('../controllers/audit.controller')

router.get(
  '/',
  verifyToken,
  verifyPermission('VIEW_AUDIT'),
  auditController.list
)

module.exports = router