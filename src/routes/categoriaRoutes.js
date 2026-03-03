const express = require("express");
const CategoriaController = require("../controllers/categoriasController");
const { autenticar, requiereRol } = require("../middlewares/auth");

const router = express.Router();

router.get("/", CategoriaController.listar);

// El admin es el único que puede modificar categorías
router.post(
  "/",
  autenticar,
  requiereRol("admin"),
  CategoriaController.crear
);

router.put(
  "/:id",
  autenticar,
  requiereRol("admin"),
  CategoriaController.actualizar
);

router.delete(
  "/:id",
  autenticar,
  requiereRol("admin"),
  CategoriaController.eliminar
);

/**
 * @swagger
 * /api/categorias/stats:
 *   get:
 *     summary: Obtener estadísticas de categorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Estadísticas devueltas exitosamente
 */
router.get("/stats", CategoriaController.obtenerEstadisticas);

/**
 * @swagger
 * /api/categorias/{id}/productos:
 *   get:
 *     summary: Listar productos de una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get("/:id/productos", CategoriaController.listarProductos);

/**
 * @swagger
 * /api/categorias/generar-descripcion:
 *   post:
 *     summary: Generar descripción de categoría con IA
 *     tags: [Categorías]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion_actual:
 *                 type: string
 *     responses:
 *       200:
 *         description: Descripción generada
 */
router.post(
  "/generar-descripcion",
  autenticar,
  requiereRol("admin"),
  CategoriaController.generarDescripcionIA
);

/**
 * @swagger
 * /api/categorias/sugerir-ia:
 *   post:
 *     summary: Sugerir categorías relacionadas con IA
 *     tags: [Categorías]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sugerencias generadas
 */
router.post(
  "/sugerir-ia",
  autenticar,
  requiereRol("admin"),
  CategoriaController.sugerirCategoriasIA
);

module.exports = router;
