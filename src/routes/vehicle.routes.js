/**
 * @openapi
 * /vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: Lista veículos (com movements)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */

/**
 * @openapi
 * /vehicles:
 *   post:
 *     tags: [Vehicles]
 *     summary: Cria veículo e registra CHECK_IN
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VehicleCreateRequest' }
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
 * /vehicles/{id}/sell:
 *   post:
 *     tags: [Vehicles]
 *     summary: Vende veículo (status SOLD + CHECK_OUT)
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
 *           schema: { $ref: '#/components/schemas/VehicleSellRequest' }
 *     responses:
 *       200: { description: OK }
 *       400:
 *         description: Erro
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

const express = require('express')
const router = express.Router()

const { verifyToken, verifyRole } = require('../middleware/auth.middleware')
const vehicleController = require('../controllers/vehicle.controller')
const { verifyPermission } = require('../middleware/permission.middleware')

router.post(
  '/',
  verifyToken,
  verifyPermission('CREATE_VEHICLE'),
  vehicleController.createVehicle
)

router.get(
  '/',
  verifyToken,
  vehicleController.listVehicles
)

router.post(
  '/:id/sell',
  verifyToken,
  verifyRole(['OWNER', 'COORDINATOR']),
  vehicleController.sellVehicle
)

module.exports = router