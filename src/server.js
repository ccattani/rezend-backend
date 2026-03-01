require('dotenv').config()
const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const app = require('./app')
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server on ${PORT}`))
app.use(cors())
app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => {
  res.json({ message: 'API Rezende Veículos funcionando' })
})

const authRoutes = require('./routes/auth.routes')

app.use('/auth', authRoutes)

const { verifyToken, verifyRole } = require('./middleware/auth.middleware')

app.get(
  '/test-owner',
  verifyToken,
  verifyRole(['OWNER']),
  (req, res) => {
    res.json({ message: 'Acesso autorizado como OWNER' })
  }
)

const vehicleRoutes = require('./routes/vehicle.routes')

app.use('/vehicles', vehicleRoutes)

const checkRoutes = require('./routes/check.routes')

app.use('/checks', checkRoutes)

// app.use('/uploads', express.static('src/uploads'))

const documentRoutes = require('./routes/document.routes')
app.use('/documents', documentRoutes)

const auditRoutes = require('./routes/audit.routes')
app.use('/audit', auditRoutes)