const { verificarToken } = require("../utils/jwt");
const Usuario = require("../models/Usuario");

const autenticar = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: true,
                mensaje: "Token no proporcionado o formato inválido",
            });
        }

        const token = authHeader.split(" ")[1];
        const payload = verificarToken(token);

        const usuario = await Usuario.buscarPorId(payload.id);
        if (!usuario) {
            return res.status(401).json({
                error: true,
                mensaje: "Usuario no válido",
            });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            mensaje: error.message,
        });
    }
};

const requiereRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const roles = Array.isArray(rolesPermitidos)
            ? rolesPermitidos
            : [rolesPermitidos];
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: true,
                mensaje: "No tienes permisos para realizar esta acción",
            });
        }
        next();
    };
};

module.exports = {
    autenticar,
    requiereRol,
};
