const express = require("express");
const ProductoController = require("../controllers/productoController");
const { autenticar, requiereRol } = require("../middlewares/auth");
const { subirImagenProducto } = require("../config/multer");
const {
  validacionParametroId,
} = require("../middlewares/validator.middleware");

const router = express.Router();

// Rutas públicas
/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar todos los productos con filtros
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get("/", ProductoController.listar);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get("/:id", validacionParametroId, ProductoController.obtener);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto (Admin/Vendedor only)
 *     tags: [Productos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post(
  "/",
  autenticar,
  requiereRol(["vendedor", "admin"]),
  subirMultiplesImagenes,
  ProductoController.crear
);

router.put(
  "/:id",
  autenticar,
  requiereRol(["vendedor", "admin"]),
  subirImagenProducto,
  ProductoController.actualizar
);

router.delete(
  "/:id",
  autenticar,
  requiereRol(["vendedor", "admin"]),
  validacionParametroId,
  ProductoController.eliminar
);

module.exports = router;
