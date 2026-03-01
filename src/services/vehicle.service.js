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