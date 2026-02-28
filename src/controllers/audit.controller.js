const prisma = require("../prisma");

exports.list = async (req, res) => {
  try {
    const { entity, action, userId, take = 50 } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(entity ? { entity } : {}),
        ...(action ? { action } : {}),
        ...(userId ? { userId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Number(take) || 50, 200),
    });

    return res.json(logs);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
