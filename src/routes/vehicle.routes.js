const express = require('express')
const router = express.Router()

const vehicleController = require('../controllers/vehicle.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { verifyRole } = require('../middleware/auth.middleware') // se seu verifyRole está nesse arquivo

router.get('/', verifyToken, vehicleController.list)
router.get('/:id', verifyToken, vehicleController.getById)
router.post('/', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.create)

// NOVO:
router.patch('/:id', verifyToken, verifyRole(['OWNER', 'COORDINATOR']), vehicleController.update)

module.exports = router