const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Marketplace Inteligente API",
      version: "1.0.0",
      description: "API completa para marketplace con integración de IA",
      contact: {
        name: "Equipo de Desarrollo",
        email: "dev@marketplace.com",
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nombre', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
              example: 1,
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único del usuario',
              example: 'juan@ejemplo.com',
            },
            rol: {
              type: 'string',
              enum: ['comprador', 'vendedor', 'admin'],
              description: 'Rol del usuario en el sistema',
              example: 'comprador',
            },
            fecha_registro: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro del usuario',
            },
          },
        },
        Producto: {
          type: 'object',
          required: ['nombre', 'precio', 'categoria_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del producto',
              example: 10,
            },
            nombre: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'iPhone 15 Pro',
            },
            descripcion: {
              type: 'string',
              description: 'Descripción detallada del producto',
              example: 'El último grito de Apple con chip A17 Pro.',
            },
            precio: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto',
              example: 999.99,
            },
            stock: {
              type: 'integer',
              description: 'Cantidad disponible',
              example: 50,
            },
            imagen_url: {
              type: 'string',
              description: 'URL de la imagen del producto',
              example: '/uploads/productos/iphone.jpg',
            },
            categoria_id: {
              type: 'integer',
              description: 'ID de la categoría',
              example: 1,
            },
            vendedor_id: {
              type: 'integer',
              description: 'ID del vendedor',
              example: 2,
            },
          },
        },
        Categoria: {
          type: 'object',
          required: ['nombre'],
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Electrónicos' },
            descripcion: { type: 'string', example: 'Lo último en tecnología' },
            imagen_icono: { type: 'string', example: '/uploads/categorias/tech.png' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'boolean',
              example: true,
            },
            mensaje: {
              type: 'string',
              example: 'Mensaje de error descriptivo',
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Marketplace API Docs",
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions,
};
