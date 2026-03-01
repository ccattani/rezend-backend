const vehicleService = require("../services/vehicle.service");

exports.createVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicle = await vehicleService.createVehicle(req.body, userId);
    return res.status(201).json(vehicle);
  } catch (err) {
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Placa já cadastrada", code: "PLATE_ALREADY_EXISTS" });
    }
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
};

exports.sellVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { saleValue } = req.body;

    const updated = await vehicleService.sellVehicle(id, saleValue, userId);
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.listVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.listVehicles();
    return res.json(vehicles);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

const prisma = require('../prisma')

exports.update = async (req, res) => {
  try {
    const { id } = req.params

    // Campos permitidos
    const {
      plate,
      model,
      year,
      purchaseValue,
      saleValue,
      status
    } = req.body

    // Monta updateData só com o que veio
    const updateData = {}

    if (plate !== undefined) updateData.plate = String(plate).trim().toUpperCase()
    if (model !== undefined) updateData.model = String(model).trim()
    if (year !== undefined) updateData.year = Number(year)
    if (purchaseValue !== undefined) updateData.purchaseValue = Number(purchaseValue)
    if (saleValue !== undefined) updateData.saleValue = saleValue === null ? null : Number(saleValue)
    if (status !== undefined) updateData.status = status

    // Validações básicas
    if (updateData.year !== undefined && Number.isNaN(updateData.year)) {
      return res.status(400).json({ error: 'year inválido' })
    }
    if (updateData.purchaseValue !== undefined && Number.isNaN(updateData.purchaseValue)) {
      return res.status(400).json({ error: 'purchaseValue inválido' })
    }
    if (updateData.saleValue !== undefined && updateData.saleValue !== null && Number.isNaN(updateData.saleValue)) {
      return res.status(400).json({ error: 'saleValue inválido' })
    }

    // Regra: se status = SOLD, precisa saleValue (se não veio no PATCH, pega do banco)
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
        return res.status(400).json({ error: 'saleValue é obrigatório quando status = SOLD' })
      }
    }

    const updated = await prisma.vehicle.update({
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

    return res.json(updated)
  } catch (err) {
    // Placa duplicada
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Placa já cadastrada', code: 'PLATE_ALREADY_EXISTS' })
    }

    console.error('vehicle update error:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
