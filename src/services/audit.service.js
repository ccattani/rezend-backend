const prisma = require('../prisma')

exports.log = async ({ userId, action, entity, entityId = null, meta = null }) => {
  if (!userId || !action || !entity) return // não quebra o fluxo por log

  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId, meta }
    })
  } catch (e) {
    // log falhou, mas o sistema não deve cair por isso
    console.error('AUDIT_LOG_ERROR:', e.message)
  }
}