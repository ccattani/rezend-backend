const ROLE_PERMISSIONS = {
  CHEFE: ['CREATE_USER', 'READ_AUDIT', 'MANAGE_VEHICLES', 'MANAGE_DOCUMENTS', 'MANAGE_CHECKS'],
  COORDENADOR: ['CREATE_USER', 'READ_AUDIT', 'MANAGE_VEHICLES', 'MANAGE_DOCUMENTS', 'MANAGE_CHECKS'],
  USER: []
}

module.exports = {
  verifyPermission(permission) {
    return (req, res, next) => {
      const role = req.user?.role
      if (!role) return res.status(401).json({ error: 'Não autenticado' })

      const perms = ROLE_PERMISSIONS[role] || []
      if (!perms.includes(permission)) {
        return res.status(403).json({ error: 'Sem permissão' })
      }

      return next()
    }
  }
}