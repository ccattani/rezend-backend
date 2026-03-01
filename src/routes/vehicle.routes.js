const express = require('express')
const router = express.Router()

const vehicleController = require('../controllers/vehicle.controller')
const { verifyToken, verifyRole } = require('../middleware/auth.middleware')

router.get('/', verifyToken, vehicleController.listVehicles)
router.get('/:id', verifyToken, vehicleController.getVehicleById)

router.post('/', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.createVehicle)

router.patch('/:id', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.update)

// (opcional) endpoint específico de venda — se você quiser manter:
router.post('/:id/sell', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.sellVehicle)

module.exports = router