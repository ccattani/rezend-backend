const prisma = require('../prisma')
const audit = require('./audit.service')
const { put } = require('@vercel/blob')


const sanitize = (name) => name.replace(/[^\w.\-]+/g, '_')

exports.createDocument = async (file, vehicleId, userId) => {
  if (!file) throw new Error('Arquivo não enviado')

  if (vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle) throw new Error('Veículo não encontrado')
  }

  // PRIVATE recomendado pra contrato
  const blob = await put(file.originalname, file.buffer, {
    access: 'private',
    contentType: file.mimetype
  })

  const doc = await prisma.document.create({
    data: {
      url: blob.url,
      pathname: blob.pathname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      vehicleId: vehicleId || null
    }
  })

  await audit.log({
    userId,
    action: 'UPLOAD_DOCUMENT',
    entity: 'Document',
    entityId: doc.id,
    meta: { originalName: doc.originalName, mimeType: doc.mimeType, size: doc.size, vehicleId: doc.vehicleId }
  })

  return doc
}