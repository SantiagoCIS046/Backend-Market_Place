const { body, param, validationResult } = require("express-validator");

const validarResultados = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({
            error: true,
            mensaje: "Datos de entrada inválidos",
            errores: errores.array(),
        });
    }
    next();
};

const validacionCrearUsuario = [
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Debe ser un correo válido").normalizeEmail(),
    body("password")
        .isLength({ min: 8 })
        .withMessage("La contraseña debe tener al menos 8 caracteres"),
    body("rol")
        .optional()
        .isIn(["comprador", "vendedor", "admin"])
        .withMessage("Rol inválido"),
    validarResultados,
];

const validacionLogin = [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
    validarResultados,
];

const validacionParametroId = [
    param("id").isInt().withMessage("El ID debe ser un número entero"),
    validarResultados,
];

const validacionActualizarUsuario = [
    param("id").isInt().withMessage("El ID debe ser un número entero"),
    body("nombre").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío"),
    body("rol").optional().isIn(["comprador", "vendedor", "admin"]),
    validarResultados,
];

const validacionCambiarPassword = [
    body("passwordActual").notEmpty().withMessage("Contraseña actual requerida"),
    body("nuevaPassword").isLength({ min: 8 }).withMessage("Mínimo 8 caracteres"),
    validarResultados
];

module.exports = {
    validacionCrearUsuario,
    validacionLogin,
    validacionParametroId,
    validacionActualizarUsuario,
    validacionCambiarPassword
};
