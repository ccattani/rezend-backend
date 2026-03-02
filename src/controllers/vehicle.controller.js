const vehicleService = require('../services/vehicle.service')

exports.createVehicle = async (req, res) => {
  try {
    const userId = req.user.id
    const vehicle = await vehicleService.createVehicle(req.body, userId)
    return res.status(201).json(vehicle)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

exports.sellVehicle = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { saleValue } = req.body

    const updated = await vehicleService.sellVehicle(id, saleValue, userId)
    return res.json(updated)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

exports.listVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.listVehicles()
    return res.json(vehicles)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

exports.updateVehicle = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const updated = await vehicleService.updateVehicle(id, req.body, userId)
    return res.json(updated)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}