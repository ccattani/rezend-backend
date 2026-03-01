const path = require('path')
const prisma = require('../prisma')
const { get } = require('@vercel/blob')
const { Readable } = require('node:stream')
const documentService = require('../services/document.service')

exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id
    const vehicleId = req.body.vehicleId || null

    const doc = await documentService.createDocument(req.file, vehicleId, userId)

    // Não vaza o caminho interno do servidor
    const { path: _internalPath, ...safe } = doc

    return res.status(201).json(safe)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params

    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return res.status(404).json({ error: 'Documento não encontrado' })

    // Busca o blob privado pelo pathname
    const result = await get(doc.pathname, { access: 'private' })

    if (!result || result.statusCode !== 200) {
      return res.status(404).json({ error: 'Arquivo não encontrado no storage' })
    }

    res.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`)

    // result.stream é Web ReadableStream -> converte para Node stream
    return Readable.fromWeb(result.stream).pipe(res)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}