const bcrypt = require('bcryptjs')
const prisma = require('../prisma') // ajuste

module.exports = {
  // Rota ADMIN: pode criar usuário e escolher role (com validação)
  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email e password são obrigatórios' })
      }

      const normalizedEmail = String(email).trim().toLowerCase()

      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (existing) {
        return res.status(409).json({ error: 'Email já cadastrado' })
      }

      const allowedRoles = ['USER', 'OWNER', 'ADMIN']
      const safeRole = allowedRoles.includes(role) ? role : 'USER'

      const passwordHash = await bcrypt.hash(String(password), 10)

      const user = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          passwordHash,
          role: safeRole
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })

      return res.status(201).json({ user })
    } catch (err) {
      console.error('createUser error:', err)
      return res.status(500).json({ error: 'Erro interno' })
    }
  }
}