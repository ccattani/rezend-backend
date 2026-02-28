const swaggerJSDoc = require("swagger-jsdoc");

module.exports = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Rezende Backend API", version: "1.0.0" },

    servers: [{ url: "http://localhost:3000" }],

    tags: [
      { name: "Auth" },
      { name: "Vehicles" },
      { name: "Checks" },
      { name: "Documents" },
      { name: "Audit" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Error: {
          type: "object",
          properties: { error: { type: "string" } },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string", example: "OPERADOR" },
            email: { type: "string", example: "operador@rezende.com" },
            password: { type: "string", example: "123456" },
            role: {
              type: "string",
              enum: ["OWNER", "COORDINATOR", "OPERATOR"],
              example: "OPERATOR",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "oper@rezende.com" },
            password: { type: "string", example: "123456" },
          },
        },
        TokenResponse: {
          type: "object",
          properties: { token: { type: "string" } },
        },
        VehicleCreateRequest: {
          type: "object",
          required: ["plate", "model", "year", "purchaseValue"],
          properties: {
            plate: { type: "string", example: "ABC1234" },
            model: { type: "string", example: "Corolla" },
            year: { type: "integer", example: 2022 },
            purchaseValue: { type: "number", example: 50000 },
            saleValue: { type: "number", nullable: true, example: 65000 },
          },
        },
        VehicleSellRequest: {
          type: "object",
          required: ["saleValue"],
          properties: { saleValue: { type: "number", example: 65000 } },
        },
        CheckCreateRequest: {
          type: "object",
          required: ["value", "issueDate", "expectedClear"],
          properties: {
            value: { type: "number", example: 12000 },
            issueDate: {
              type: "string",
              format: "date",
              example: "2026-02-28",
            },
            expectedClear: {
              type: "string",
              format: "date",
              example: "2026-03-10",
            },
            observation: {
              type: "string",
              nullable: true,
              example: "Entrada financiamento",
            },
          },
        },
        CheckUpdateStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["PENDING", "CLEARED", "RETURNED"],
              example: "CLEARED",
            },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: ["./src/routes/*.js"],
});
