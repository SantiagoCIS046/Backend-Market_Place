const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const { swaggerUi, specs, swaggerOptions } = require("./src/config/swagger");
require("dotenv").config();

const config = require("./src/config/app.js");
const { testConnection } = require("./src/config/database.js");

// Importar Rutas (asumiendo nombres de archivos basados en la estructura vista)
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const productoRoutes = require("./src/routes/productoRoutes");
const authRoutes = require("./src/routes/authRoutes");
const categoriaRoutes = require("./src/routes/categoriaRoutes");
const pedidoRoutes = require("./src/routes/pedidoRoutes");

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Rutas base
app.get("/", (req, res) => {
  res.json({
    mensaje: "Marketplace Inteligente API",
    version: "1.0.0",
    documentacion: "/api-docs",
  });
});

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Rutas de la API
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/pedidos", pedidoRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: true,
    mensaje: err.message || "Error interno del servidor",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    mensaje: "Endpoint no encontrado",
  });
});

const PORT = config.server.port;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  // Intento de conexión a la DB si existe la función testConnection (la agregaré a database.js)
  try {
    const { pool } = require("./src/config/database.js");
    const [rows] = await pool.query("SELECT 1");
    console.log("✅ Conexión a base de datos exitosa");
  } catch (err) {
    console.error("❌ Error al conectar con la base de datos:", err.message);
  }
});
