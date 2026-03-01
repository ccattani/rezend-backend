/**
 * @openapi
 * /documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload de documento (COLABORADOR/COORDENADOR)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               vehicleId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201: { description: Criado }
 *       400:
 *         description: Erro
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /documents/{id}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Download protegido do documento
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Arquivo
 *       404:
 *         description: Não encontrado
 */
const express = require('express')
const router = express.Router()

const upload = require('../middleware/upload.middleware')
const { verifyToken } = require('../middleware/auth.middleware')
const { verifyPermission } = require('../middleware/permission.middleware')
const documentController = require('../controllers/document.controller')

router.post(
  '/',
  verifyToken,
  verifyPermission('UPLOAD_DOCUMENT'),
  upload.single('file'),
  documentController.uploadDocument
)

router.get(
  '/:id/download',
  verifyToken,
  verifyPermission('VIEW_DOCUMENTS'),
  documentController.downloadDocument
)

module.exports = router