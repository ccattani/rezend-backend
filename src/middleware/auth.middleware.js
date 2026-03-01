
const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // padroniza o formato do req.user
    req.user = {
      id: decoded.sub,          // <- AQUI está a chave
      email: decoded.email,
      role: decoded.role
    }

    if (!req.user.id) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

exports.verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    next()
  }
}
