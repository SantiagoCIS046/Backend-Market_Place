const Pedido = require("../models/Pedido");

class PedidoController {
    static async crear(req, res, next) {
        try {
            const { total, direccion_envio, notas, items } = req.body;

            if (!items || items.length === 0) {
                return res.status(400).json({
                    error: true,
                    mensaje: "La orden debe tener al menos un producto",
                });
            }

            const nuevaOrden = await Pedido.crear(
                {
                    comprador_id: req.usuario.id,
                    total,
                    direccion_envio,
                    notas,
                },
                items
            );

            res.status(201).json({
                error: false,
                mensaje: "Orden creada exitosamente",
                orden: nuevaOrden,
            });
        } catch (error) {
            next(error);
        }
    }

    static async obtener(req, res, next) {
        try {
            const { id } = req.params;
            const orden = await Pedido.buscarPorId(id);

            if (!orden) {
                return res.status(404).json({
                    error: true,
                    mensaje: "Orden no encontrada",
                });
            }

            // Solo el comprador, el vendedor de los productos o un admin pueden ver la orden
            // Simplificando: solo el comprador o admin por ahora
            if (orden.comprador_id !== req.usuario.id && req.usuario.rol !== "admin") {
                // Verificar si es vendedor de algún item
                const esVendedor = orden.detalles.some(d => d.vendedor_nombre === req.usuario.nombre);
                if (!esVendedor) {
                    return res.status(403).json({
                        error: true,
                        mensaje: "No tienes permiso para ver esta orden",
                    });
                }
            }

            res.json({
                error: false,
                orden,
            });
        } catch (error) {
            next(error);
        }
    }

    static async listar(req, res, next) {
        try {
            const ordenes = await Pedido.obtenerPorUsuario(req.usuario.id, req.usuario.rol);
            res.json({
                error: false,
                ordenes,
            });
        } catch (error) {
            next(error);
        }
    }

    static async actualizarEstado(req, res, next) {
        try {
            const { id } = req.params;
            const { estado, notas } = req.body;

            // Solo admin o vendedores (con lógica adicional) podrían cambiar estado
            const orden = await Pedido.actualizarEstado(id, estado, notas);

            res.json({
                error: false,
                mensaje: "Estado de orden actualizado",
                orden,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PedidoController;
