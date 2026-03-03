const Producto = require("../models/Producto");
const gemini = require("../config/gemini");

class ProductoController {
    static async crear(req, res, next) {
        try {
            const { categoria_id, nombre, descripcion, precio, stock, generar_ia } =
                req.body;
            let finalDescripcion = descripcion;

            // Integración con IA si se solicita
            if (generar_ia === "true" || generar_ia === true) {
                try {
                    // Usamos el nuevo método del GeminiClient
                    finalDescripcion = await gemini.generarDescripcionProducto(nombre, "General", descripcion);
                } catch (aiError) {
                    console.error("AI Error:", aiError.message);
                }
            }

            const imagen_url = req.file ? `/uploads/productos/${req.file.filename}` :
                (req.files && req.files.length > 0 ? `/uploads/productos/${req.files[0].filename}` : null);

            const nuevoProducto = await Producto.crear({
                vendedor_id: req.usuario.id,
                categoria_id,
                nombre,
                descripcion: finalDescripcion,
                precio,
                stock,
                imagen_url,
            });

            // Guardar imágenes adicionales si existen (Galería)
            if (req.files && req.files.length > 1) {
                for (let i = 1; i < req.files.length; i++) {
                    await Producto.agregarImagen(nuevoProducto.id, `/uploads/productos/${req.files[i].filename}`);
                }
            }

            res.status(201).json({
                error: false,
                mensaje: "Producto creado exitosamente",
                producto: nuevoProducto,
            });
        } catch (error) {
            next(error);
        }
    }

    static async obtener(req, res, next) {
        try {
            const { id } = req.params;
            const producto = await Producto.buscarPorId(id);
            if (!producto) {
                return res.status(404).json({
                    error: true,
                    mensaje: "Producto no encontrado",
                });
            }
            res.json({
                error: false,
                producto,
            });
        } catch (error) {
            next(error);
        }
    }

    static async listar(req, res, next) {
        try {
            const filtros = {
                categoria_id: req.query.categoria_id,
                vendedor_id: req.query.vendedor_id,
                precio_min: req.query.precio_min,
                precio_max: req.query.precio_max,
                en_stock: req.query.en_stock,
                busqueda: req.query.q,
                limite: req.query.limite,
                pagina: req.query.pagina,
            };
            const productos = await Producto.obtenerConFiltros(filtros);
            res.json({
                error: false,
                productos,
            });
        } catch (error) {
            next(error);
        }
    }

    static async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const datos = { ...req.body };
            if (req.file) {
                datos.imagen_url = `/uploads/productos/${req.file.filename}`;
            }

            const producto = await Producto.actualizar(id, datos);
            res.json({
                error: false,
                mensaje: "Producto actualizado",
                producto,
            });
        } catch (error) {
            next(error);
        }
    }

    static async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await Producto.eliminar(id);
            res.json({
                error: false,
                mensaje: "Producto eliminado",
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductoController;
