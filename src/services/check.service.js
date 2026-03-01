const prisma = require('../prisma')
const audit = require('./audit.service')

exports.createCheck = async (data, userId) => {
  const { value, issueDate, expectedClear, observation } = data

  if (value == null || value <= 0 || !issueDate || !expectedClear) {
    throw new Error('Campos obrigatórios não preenchidos ou valor inválido')
  }

  const created = await prisma.check.create({
    data: {
      value,
      issueDate: new Date(issueDate),
      expectedClear: new Date(expectedClear),
      observation: observation ?? null
    }
  })

  await audit.log({
    userId,
    action: 'CREATE_CHECK',
    entity: 'Check',
    entityId: created.id,
    meta: {
      value: created.value,
      issueDate: created.issueDate,
      expectedClear: created.expectedClear,
      observation: created.observation
    }
  })

  return created
}

exports.updateStatus = async (id, status, userId) => {
  const allowed = ['PENDING', 'CLEARED', 'RETURNED']
  if (!allowed.includes(status)) {
    throw new Error('Status inválido')
  }

  const prev = await prisma.check.findUnique({ where: { id } })
  if (!prev) throw new Error('Cheque não encontrado')

  // regra mais coerente (opcional, mas recomendado)
  if (prev.status !== 'PENDING') {
    throw new Error('Cheque já finalizado e não pode mudar de status')
  }

  const updated = await prisma.check.update({
    where: { id },
    data: { status }
  })

  await audit.log({
    userId,
    action: 'UPDATE_CHECK_STATUS',
    entity: 'Check',
    entityId: id,
    meta: { fromStatus: prev.status, toStatus: status }
  })

  return updated
}

exports.listChecks = async () => {
  return await prisma.check.findMany({
    orderBy: { createdAt: 'desc' }
  })
}