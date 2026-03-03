const express = require("express");
const AuthController = require("../controllers/authController");
const { limiterAuth } = require("../middlewares/rateLimiter");
const { autenticar } = require("../middlewares/auth");
const {
  validacionCrearUsuario,
  validacionLogin,
  validacionCambiarPassword,
} = require("../middlewares/validator.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario registrado
 */
router.post(
  "/registro",
  limiterAuth,
  validacionCrearUsuario,
  AuthController.registro
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login exitoso y entrega de token
 */
router.post("/login", limiterAuth, validacionLogin, AuthController.login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 */
router.get("/perfil", autenticar, AuthController.perfil);
router.get('/insights', autenticar, AuthController.getInsights);

router.post(
  "/cambio-password",
  autenticar,
  validacionCambiarPassword,
  AuthController.cambiarPassword
);

module.exports = router;
