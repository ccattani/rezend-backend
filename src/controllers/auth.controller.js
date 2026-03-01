const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma') // ajuste se necessário

function signToken(user) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não configurado')

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

module.exports = {
  // Cadastro público: SEMPRE cria OPERATOR (menor privilégio do seu enum)
  async register(req, res) {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email e password são obrigatórios' })
      }

      const normalizedEmail = String(email).trim().toLowerCase()

      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (existing) {
        return res.status(409).json({ error: 'Email já cadastrado' })
      }

      // guarda HASH no campo "password"
      const passwordHash = await bcrypt.hash(String(password), 10)

      const user = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          password: passwordHash,   // <- IMPORTANTE (schema exige "password")
          role: 'OPERATOR'          // <- IMPORTANTE (enum Role)
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })

      const token = signToken(user)
      return res.status(201).json({ user, token })
    } catch (err) {
      console.error('register error:', err)
      return res.status(500).json({ error: 'Erro interno', details: err.message, code: err.code })
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'email e password são obrigatórios' })
      }

      const normalizedEmail = String(email).trim().toLowerCase()

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      // compara contra o hash guardado em user.password
      const ok = await bcrypt.compare(String(password), user.password)
      if (!ok) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      const token = signToken(user)
      return res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
      })
    } catch (err) {
      console.error('login error:', err)
      return res.status(500).json({ error: 'Erro interno', details: err.message, code: err.code })
    }
  },

  async me(req, res){
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    return res.json({ user })
  } catch (err) {
    console.error('me error:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
}