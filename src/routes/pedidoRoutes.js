const express = require("express");
const PedidoController = require("../controllers/pedidoController");
const { autenticar, requiereRol } = require("../middlewares/auth");
const { validacionParametroId } = require("../middlewares/validator.middleware");

const router = express.Router();

router.use(autenticar);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Realizar un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Pedido creado con éxito
 */
router.post("/", PedidoController.crear);

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Listar pedidos del usuario actual
 *     tags: [Pedidos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get("/", PedidoController.listar);
router.get("/:id", validacionParametroId, PedidoController.obtener);
router.patch("/:id/estado", requiereRol(["admin", "vendedor"]), PedidoController.actualizarEstado);

module.exports = router;
