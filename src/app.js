require('dotenv').config()
const express = require('express')
const cors = require('cors')

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const authRoutes = require('./routes/auth.routes')
const vehicleRoutes = require('./routes/vehicle.routes')
const checkRoutes = require('./routes/check.routes')
const documentRoutes = require('./routes/document.routes')
const auditRoutes = require('./routes/audit.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.json({ message: 'API Rezende Veículos funcionando' }))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/auth', authRoutes)
app.use('/vehicles', vehicleRoutes)
app.use('/checks', checkRoutes)
app.use('/documents', documentRoutes)
app.use('/audit', auditRoutes)

module.exports = app