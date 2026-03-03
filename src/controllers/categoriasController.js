const Categoria = require("../models/Categoria");

class CategoriasController {
    static async listar(req, res, next) {
        try {
            const categorias = await Categoria.obtenerTodas();
            res.json({
                error: false,
                categorias,
            });
        } catch (error) {
            next(error);
        }
    }

    static async obtener(req, res, next) {
        try {
            const { id } = req.params;
            const categoria = await Categoria.buscarPorId(id);
            if (!categoria) {
                return res.status(404).json({
                    error: true,
                    mensaje: "Categoría no encontrada",
                });
            }
            res.json({
                error: false,
                categoria,
            });
        } catch (error) {
            next(error);
        }
    }

    static async crear(req, res, next) {
        try {
            const { nombre, descripcion } = req.body;
            const imagen_icono = req.file ? `/uploads/categorias/${req.file.filename}` : null;

            const nuevaCategoria = await Categoria.crear({
                nombre,
                descripcion,
                imagen_icono,
            });

            res.status(201).json({
                error: false,
                mensaje: "Categoría creada",
                categoria: nuevaCategoria,
            });
        } catch (error) {
            next(error);
        }
    }

    static async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;
            const datos = { nombre, descripcion };
            if (req.file) {
                datos.imagen_icono = `/uploads/categorias/${req.file.filename}`;
            }

            const categoria = await Categoria.actualizar(id, datos);
            res.json({
                error: false,
                mensaje: "Categoría actualizada",
                categoria,
            });
        } catch (error) {
            next(error);
        }
    }

    static async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await Categoria.eliminar(id);
            res.json({
                error: false,
                mensaje: "Categoría eliminada",
            });
        } catch (error) {
            next(error);
        }
    }

    static async generarDescripcionIA(req, res, next) {
        try {
            const { nombre, descripcion_actual } = req.body;
            const gemini = require("../config/gemini");
            const descripcion = await gemini.generarDescripcionCategoria(nombre, descripcion_actual);
            res.json({
                error: false,
                descripcion,
            });
        } catch (error) {
            next(error);
        }
    }

    static async sugerirCategoriasIA(req, res, next) {
        try {
            const { nombre, descripcion } = req.body;
            const gemini = require("../config/gemini");
            const sugerencias = await gemini.sugerirCategorias(nombre, descripcion);
            res.json({
                error: false,
                sugerencias,
            });
        } catch (error) {
            next(error);
        }
    }

    static async obtenerEstadisticas(req, res, next) {
        try {
            const estadisticas = await Categoria.obtenerEstadisticas();
            res.json({
                error: false,
                estadisticas,
            });
        } catch (error) {
            next(error);
        }
    }

    static async listarProductos(req, res, next) {
        try {
            const { id } = req.params;
            const filtros = {
                limite: req.query.limite,
                pagina: req.query.pagina,
                minPrice: req.query.minPrice,
                maxPrice: req.query.maxPrice,
            };
            const productos = await Categoria.obtenerProductos(id, filtros);
            res.json({
                error: false,
                productos,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CategoriasController;
