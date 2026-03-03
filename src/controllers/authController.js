const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const { generarToken } = require("../utils/jwt");
const config = require("../config/app");

class AuthController {
    static async registro(req, res, next) {
        try {
            const { nombre, email, password, rol } = req.body;

            const usuarioExistente = await Usuario.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(409).json({
                    error: true,
                    mensaje: "El email ya está registrado",
                });
            }

            const passwordHash = await bcrypt.hash(password, config.segurity.bcryptRounds);
            const nuevoUsuario = await Usuario.crear({
                nombre,
                email,
                password: passwordHash,
                rol: rol || "comprador",
            });

            const token = generarToken(nuevoUsuario);

            res.status(201).json({
                error: false,
                mensaje: "Usuario registrado exitosamente",
                usuario: {
                    id: nuevoUsuario.id,
                    nombre: nuevoUsuario.nombre,
                    email: nuevoUsuario.email,
                    rol: nuevoUsuario.rol,
                },
                token,
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({
                    error: true,
                    mensaje: "Credenciales incorrectas",
                });
            }

            const esValida = await bcrypt.compare(password, usuario.password);
            if (!esValida) {
                return res.status(401).json({
                    error: true,
                    mensaje: "Credenciales incorrectas",
                });
            }

            const token = generarToken(usuario);

            res.json({
                error: false,
                mensaje: "Inicio de sesión exitoso",
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                },
                token,
            });
        } catch (error) {
            next(error);
        }
    }

    static async perfil(req, res, next) {
        try {
            res.json({
                error: false,
                usuario: req.usuario,
            });
        } catch (error) {
            next(error);
        }
    }

    static async cambiarPassword(req, res, next) {
        try {
            const { passwordActual, nuevaPassword } = req.body;
            const usuario = await Usuario.buscarPorId(req.usuario.id);

            // El modelo buscarPorId devuelve el password si no especificamos campos,
            // pero en nuestro modelo actual lo devuelve filtrado. Necesito el password completo.
            // Voy a asumir que buscarPorId en el modelo ya habilitado lo trae o lo busco por email.
            const usuarioCompleto = await Usuario.buscarPorEmail(req.usuario.email);

            const esValida = await bcrypt.compare(passwordActual, usuarioCompleto.password);
            if (!esValida) {
                return res.status(401).json({
                    error: true,
                    mensaje: "Contraseña actual incorrecta",
                });
            }

            const nuevoHash = await bcrypt.hash(nuevaPassword, config.segurity.bcryptRounds);
            await Usuario.actualizarPassword(req.usuario.id, nuevoHash);

            res.json({
                error: false,
                mensaje: "Contraseña actualizada exitosamente",
            });
        } catch (error) {
            next(error);
        }
    }

    static async getInsights(req, res, next) {
        try {
            const gemini = require('../config/gemini');
            const Pedido = require('../models/Pedido');
            const ordenes = await Pedido.obtenerPorUsuario(req.usuario.id, req.usuario.rol);
            const insights = await gemini.analizarPatronCompras(ordenes);
            res.json({
                error: false,
                insights
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
