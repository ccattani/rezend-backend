const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_OWNER_EMAIL
  const password = process.env.SEED_OWNER_PASSWORD
  const name = process.env.SEED_OWNER_NAME || 'OWNER'

  if (!email || !password) {
    throw new Error('SEED_OWNER_EMAIL e SEED_OWNER_PASSWORD são obrigatórios')
  }

  // se já existe OWNER, não faz nada
  const existingOwner = await prisma.user.findFirst({ where: { role: 'OWNER' } })
  if (existingOwner) {
    console.log('OWNER já existe:', existingOwner.email)
    return
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const existingByEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingByEmail) {
    // promove esse usuário a OWNER
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { role: 'OWNER', name: existingByEmail.name || name }
    })
    console.log('Usuário existente promovido a OWNER:', normalizedEmail)
    return
  }

  const passwordHash = await bcrypt.hash(String(password), 10)

  const owner = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      password: passwordHash, // guarda hash no campo password
      role: 'OWNER'
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  console.log('OWNER criado:', owner.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })