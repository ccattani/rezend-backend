const checkService = require('../services/check.service')

exports.createCheck = async (req, res) => {
  try {
    const userId = req.user.id
    const result = await checkService.createCheck(req.body, userId)
    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { status } = req.body

    const result = await checkService.updateStatus(id, status, userId)
    return res.json(result)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

exports.listChecks = async (req, res) => {
  try {
    const result = await checkService.listChecks()
    return res.json(result)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}