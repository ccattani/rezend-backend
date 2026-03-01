const permissions = require('../config/permissions')

exports.verifyPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const allowedRoles = permissions[permission]

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissão insuficiente' })
    }

    next()
  }
}