require('dotenv').config()
const bcrypt = require('bcryptjs')
const prisma = require('../src/prisma')

async function main() {
  const email = process.env.SEED_OWNER_EMAIL
  const password = process.env.SEED_OWNER_PASSWORD
  const name = process.env.SEED_OWNER_NAME || 'DONO'

  if (!email || !password) {
    throw new Error('Defina SEED_OWNER_EMAIL e SEED_OWNER_PASSWORD')
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return

  const hash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { name, email, password: hash, role: 'CHEFE' }
  })

  console.log('CHEFE seed criado:', email)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })