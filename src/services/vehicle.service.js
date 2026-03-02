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

function buildDiff(before, after) {
  const diff = {}
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      diff[key] = { from: before[key], to: after[key] }
    }
  }
  return diff
}

exports.updateVehicle = async (vehicleId, data, userId) => {
  const { plate, model, year, purchaseValue } = data

  // Não deixa update vazio (senão vira endpoint inútil e sujo)
  const hasAny =
    plate !== undefined ||
    model !== undefined ||
    year !== undefined ||
    purchaseValue !== undefined

  if (!hasAny) throw new Error('Nenhum campo para atualizar')

  // Validações por campo (só valida se o campo veio)
  if (plate !== undefined && String(plate).trim().length < 5) {
    throw new Error('Placa inválida')
  }

  if (model !== undefined && String(model).trim().length < 2) {
    throw new Error('Modelo inválido')
  }

  if (year !== undefined) {
    const y = Number(year)
    if (!Number.isInteger(y) || y < 1900 || y > 2100) {
      throw new Error('Ano inválido')
    }
  }

  if (purchaseValue !== undefined) {
    const pv = Number(purchaseValue)
    if (Number.isNaN(pv) || pv <= 0) {
      throw new Error('Valor de compra inválido')
    }
  }

  return await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle) throw new Error('Veículo não encontrado')

    // Regra: não altera veículo vendido
    if (vehicle.status !== 'IN_STOCK') {
      throw new Error('Não é permitido editar veículo fora de estoque')
    }

    const updateData = {}
    if (plate !== undefined) updateData.plate = String(plate).trim()
    if (model !== undefined) updateData.model = String(model).trim()
    if (year !== undefined) updateData.year = Number(year)
    if (purchaseValue !== undefined) updateData.purchaseValue = Number(purchaseValue)

    // Se não mudou nada de verdade, não atualiza (evita audit lixo)
    const wouldBe = { ...vehicle, ...updateData }
    const diff = buildDiff(vehicle, wouldBe)
    if (Object.keys(diff).length === 0) return vehicle

    let updated
    try {
      updated = await tx.vehicle.update({
        where: { id: vehicleId },
        data: updateData
      })
    } catch (err) {
      // placa duplicada (unique)
      if (err?.code === 'P2002') {
        throw new Error('Placa já cadastrada')
      }
      throw err
    }

    await tx.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_VEHICLE',
        entity: 'Vehicle',
        entityId: vehicleId,
        meta: {
          changes: diff
        }
      }
    })

    return updated
  })
}

exports.getVehicleById = async (id) => {
  return await prisma.vehicle.findUnique({
    where: { id },
    include: {
      movements: { orderBy: { createdAt: 'asc' } }
    }
  })
}