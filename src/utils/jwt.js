const jwt = require("jsonwebtoken");
const config = require("../config/app");

const generarToken = (usuario) => {
    const payload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
    };
    return jwt.sign(payload, config.segurity.jwtSecret, {
        expiresIn: config.segurity.jwtExpire,
    });
};

const verificarToken = (token) => {
    try {
        return jwt.verify(token, config.segurity.jwtSecret);
    } catch (error) {
        throw new Error("Token inválido o expirado");
    }
};

module.exports = {
    generarToken,
    verificarToken,
};
