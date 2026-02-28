const path = require('path')
const swaggerJSDoc = require('swagger-jsdoc')

module.exports = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Rezende Backend API', version: '1.0.0' },
    servers: [{ url: process.env.PUBLIC_BASE_URL || 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, 'routes', '*.js')]
})