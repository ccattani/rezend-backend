const prisma = require('../prisma')
const audit = require('./audit.service')

exports.createVehicle = async (data, userId) => {
  const { plate, model, year, purchaseValue, saleValue } = data

  if (!plate || !model || year == null || purchaseValue == null) {
    throw new Error('Campos obrigatórios não preenchidos')
  }

  return await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.create({
      data: {
        plate,
        model,
        year: Number(year),
        purchaseValue: Number(purchaseValue),
        saleValue: saleValue == null ? null : Number(saleValue)
      }
    })

    await tx.vehicleMovement.create({
      data: {
        type: 'CHECK_IN',
        vehicleId: vehicle.id,
        userId
      }
    })

    // loga DEPOIS de criar
    await tx.auditLog.create({
      data: {
        userId,
        action: 'CREATE_VEHICLE',
        entity: 'Vehicle',
        entityId: vehicle.id,
        meta: {
          plate: vehicle.plate,
          model: vehicle.model,
          year: vehicle.year,
          purchaseValue: vehicle.purchaseValue,
          saleValue: vehicle.saleValue
        }
      }
    })

    return vehicle
  })
}

exports.sellVehicle = async (vehicleId, saleValue, userId) => {
  if (saleValue == null || Number(saleValue) <= 0) {
    throw new Error('Valor de venda é obrigatório e deve ser maior que zero')
  }

  return await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle) throw new Error('Veículo não encontrado')
    if (vehicle.status !== 'IN_STOCK') throw new Error('Veículo não está disponível para venda')

    const updated = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: 'SOLD',
        saleValue: Number(saleValue)
      }
    })

    await tx.vehicleMovement.create({
      data: {
        type: 'CHECK_OUT',
        vehicleId,
        userId
      }
    })

    await tx.auditLog.create({
      data: {
        userId,
        action: 'SELL_VEHICLE',
        entity: 'Vehicle',
        entityId: vehicleId,
        meta: {
          fromStatus: vehicle.status,
          toStatus: 'SOLD',
          saleValue: Number(saleValue)
        }
      }
    })

    return updated
  })
}

exports.listVehicles = async () => {
  return await prisma.vehicle.findMany({
    include: {
      movements: { orderBy: { createdAt: 'asc' } }
    }
  })
}

async function updateVehicle(id, body) {
  const { plate, model, year, purchaseValue, saleValue, status } = body

  const updateData = {}

  if (plate !== undefined) updateData.plate = String(plate).trim().toUpperCase()
  if (model !== undefined) updateData.model = String(model).trim()
  if (year !== undefined) updateData.year = Number(year)
  if (purchaseValue !== undefined) updateData.purchaseValue = Number(purchaseValue)
  if (saleValue !== undefined) updateData.saleValue = saleValue === null ? null : Number(saleValue)
  if (status !== undefined) updateData.status = status

  if (updateData.year !== undefined && Number.isNaN(updateData.year)) {
    const err = new Error('year inválido')
    err.status = 400
    throw err
  }
  if (updateData.purchaseValue !== undefined && Number.isNaN(updateData.purchaseValue)) {
    const err = new Error('purchaseValue inválido')
    err.status = 400
    throw err
  }
  if (updateData.saleValue !== undefined && updateData.saleValue !== null && Number.isNaN(updateData.saleValue)) {
    const err = new Error('saleValue inválido')
    err.status = 400
    throw err
  }

  if (updateData.status === 'SOLD') {
    let finalSaleValue = updateData.saleValue

    if (finalSaleValue === undefined) {
      const current = await prisma.vehicle.findUnique({
        where: { id },
        select: { saleValue: true }
      })
      finalSaleValue = current?.saleValue
    }

    if (finalSaleValue === null || finalSaleValue === undefined) {
      const err = new Error('saleValue é obrigatório quando status = SOLD')
      err.status = 400
      throw err
    }
  }

  return prisma.vehicle.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      plate: true,
      model: true,
      year: true,
      purchaseValue: true,
      saleValue: true,
      status: true,
      createdAt: true
    }
  })
}

module.exports = {
  // ...seus outros exports
  updateVehicle
}