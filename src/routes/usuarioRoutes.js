const express = require("express");
const UsuarioController = require("../controllers/usuarioController");
const {
  validacionCrearUsuario,
  validacionActualizarUsuario,
  validacionParametroId,
} = require("../middlewares/validator.middleware");
const { autenticar, requiereRol } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post("/", validacionCrearUsuario, UsuarioController.crear);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios (Admin only)
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", autenticar, requiereRol("admin"), UsuarioController.listar);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", validacionParametroId, UsuarioController.obtener);
router.put("/:id", validacionActualizarUsuario, UsuarioController.actualizar);
router.delete("/:id", validacionParametroId, UsuarioController.eliminar);

module.exports = router;
