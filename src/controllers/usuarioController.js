const Usuario = require("../models/Usuario");

class UsuarioController {
    static async crear(req, res, next) {
        try {
            // Nota: Este endpoint puede ser usado por admin para crear usuarios directamente
            const { nombre, email, password, rol } = req.body;
            const usuarioExistente = await Usuario.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(409).json({
                    error: true,
                    mensaje: "El email ya está registrado",
                });
            }

            const bcrypt = require("bcryptjs");
            const config = require("../config/app");
            const passwordHash = await bcrypt.hash(password, config.segurity.bcryptRounds);

            const nuevoUsuario = await Usuario.crear({
                nombre,
                email,
                password: passwordHash,
                rol,
            });

            res.status(201).json({
                error: false,
                mensaje: "Usuario creado exitosamente",
                usuario: nuevoUsuario,
            });
        } catch (error) {
            next(error);
        }
    }

    static async obtener(req, res, next) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({
                    error: true,
                    mensaje: "Usuario no encontrado",
                });
            }
            res.json({
                error: false,
                usuario,
            });
        } catch (error) {
            next(error);
        }
    }

    static async listar(req, res, next) {
        try {
            const filtros = {
                rol: req.query.rol,
                busqueda: req.query.q,
                pagina: req.query.pagina,
                limite: req.query.limite,
                dir: req.query.dir,
                orden: req.query.orden,
                desde: req.query.desde,
                hasta: req.query.hasta,
            };
            const usuarios = await Usuario.obtenerTodos(filtros);
            res.json({
                error: false,
                usuarios,
                filtros_aplicados: filtros,
            });
        } catch (error) {
            next(error);
        }
    }

    static async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const { nombre, rol } = req.body;

            const usuarioDoc = await Usuario.actualizar(id, { nombre, rol });
            res.json({
                error: false,
                mensaje: "Usuario actualizado",
                usuario: usuarioDoc,
            });
        } catch (error) {
            next(error);
        }
    }

    static async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await Usuario.eliminar(id);
            res.json({
                error: false,
                mensaje: "Usuario eliminado correctamente",
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UsuarioController;
