const rateLimit = require("express-rate-limit");
const config = require("../config/app");

const limiterAuth = rateLimit({
    windowMs: config.segurity.rateLimit.window * 60 * 1000,
    max: config.segurity.rateLimit.max,
    message: {
        error: true,
        mensaje: "Demasiadas peticiones desde esta IP, intente de nuevo más tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    limiterAuth,
};
