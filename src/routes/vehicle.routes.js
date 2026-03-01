const express = require('express')
const router = express.Router()

const vehicleController = require('../controllers/vehicle.controller')
const { verifyToken, verifyRole } = require('../middleware/auth.middleware')

// LEITURA: qualquer usuário logado
router.get('/', verifyToken, vehicleController.listVehicles)
router.get('/:id', verifyToken, vehicleController.getVehicleById)

// ESCRITA: só OWNER/COORDINATOR
router.post('/', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.createVehicle)
router.patch('/:id', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.updateVehicle)

// opcional
router.post('/:id/sell', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.sellVehicle)

module.exports = router