const prisma = require("../prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Roles válidas no sistema
const ROLES = Object.freeze({
  CHEFE: "CHEFE",
  COORDENADOR: "COORDENADOR",
  COLABORADOR: "COLABORADOR",
});

// Quais roles o OWNER pode criar via /register
// Recomendação: não permitir criar OWNER por aqui.
const ALLOWED_CREATE_ROLES = [ROLES.COORDENADOR, ROLES.COLABORADOR];

// Helper para responder user sem campos sensíveis
function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // validações básicas
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Campos obrigatórios: name, email, password, role" });
    }

    // valida role (lista fechada)
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ error: "Role inválida" });
    }

    // bloqueia criação de OWNER por este endpoint
    if (!ALLOWED_CREATE_ROLES.includes(role)) {
      return res.status(400).json({ error: "Não é permitido criar usuário com esta role" });
    }

    // opcional: reforço (caso sua rota esteja mal protegida)
    // Só OWNER pode criar usuário aqui.
    // Se você já garante no router, isso vira redundante, mas é uma rede de segurança.
    if (req.user?.role !== ROLES.CHEFE) {
      return res.status(403).json({ error: "Apenas o chefe pode criar usuários" });
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (userExists) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Campos obrigatórios: email, password" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json({ user });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
};