const vehicleService = require('../services/vehicle.service')

exports.createVehicle = async (req, res) => {
  try {
    const userId = req.user.id
    const vehicle = await vehicleService.createVehicle(req.body, userId)
    return res.status(201).json(vehicle)
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Placa já cadastrada', code: 'PLATE_ALREADY_EXISTS' })
    }
    console.error('createVehicle error:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}

exports.listVehicles = async (req, res) => {
  try {
    const { status } = req.query
    const vehicles = await vehicleService.listVehicles({ status })
    return res.json(vehicles)
  } catch (err) {
    console.error('listVehicles error:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}

exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params
    const vehicle = await vehicleService.getVehicleById(id)
    return res.json(vehicle)
  } catch (err) {
    const status = err?.status || 500
    if (status === 404) return res.status(404).json({ error: err.message })
    console.error('getVehicleById error:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params
    const updated = await vehicleService.updateVehicle(id, req.body)
    return res.json(updated)
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Placa já cadastrada', code: 'PLATE_ALREADY_EXISTS' })
    }
    const status = err?.status || 500
    if (status !== 500) return res.status(status).json({ error: err.message })
    console.error('updateVehicle error:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}

exports.sellVehicle = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { saleValue } = req.body

    const updated = await vehicleService.sellVehicle(id, saleValue, userId)
    return res.json(updated)
  } catch (err) {
    const status = err?.status || 400
    return res.status(status).json({ error: err.message })
  }
}