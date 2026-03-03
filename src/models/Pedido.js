const { executeQuery, pool } = require("../config/database");

class Pedido {
  static async crear(datosOrden, detallesProductos) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { comprador_id, total, direccion_envio, notas } = datosOrden;

      // Crear la orden principal
      const queryOrden = `
        INSERT INTO orders (comprador_id, total, estado, direccion_envio, notas, fecha_orden)
        VALUES (?, ?, 'pendiente', ?, ?, NOW())
      `;
      const [resultadoOrden] = await connection.execute(queryOrden, [
        comprador_id,
        total,
        direccion_envio,
        notas,
      ]);
      const ordenId = resultadoOrden.insertId;

      // Validar stock y crear detalles
      for (const detalle of detallesProductos) {
        const { producto_id, cantidad, precio_unitario } = detalle;

        // Verificar stock actual con bloqueo
        const [productos] = await connection.execute(
          "SELECT stock, precio FROM products WHERE id = ? FOR UPDATE",
          [producto_id]
        );

        if (productos.length === 0) {
          throw new Error(`Producto ${producto_id} no encontrado`);
        }

        const producto = productos[0];
        if (producto.stock < cantidad) {
          throw new Error(
            `Stock insuficiente para producto ${producto_id}. ` +
            `Disponible: ${producto.stock}, Solicitado: ${cantidad}`
          );
        }

        // Reducir stock
        await connection.execute(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [cantidad, producto_id]
        );

        // Crear detalle de orden
        await connection.execute(
          `
          INSERT INTO order_details (orden_id, producto_id, cantidad, precio_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `,
          [ordenId, producto_id, cantidad, precio_unitario, cantidad * precio_unitario]
        );
      }

      await connection.commit();
      return await this.buscarPorId(ordenId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async buscarPorId(id) {
    const queryOrden = `
      SELECT o.*, u.nombre as comprador_nombre, u.email as comprador_email
      FROM orders o
      LEFT JOIN users u ON o.comprador_id = u.id
      WHERE o.id = ?
    `;

    const ordenes = await executeQuery(queryOrden, [id]);
    if (ordenes.length === 0) return null;

    const orden = ordenes[0];

    // Obtener detalles de la orden
    const queryDetalles = `
      SELECT od.*, p.nombre as producto_nombre, p.imagen_url, u.nombre as vendedor_nombre
      FROM order_details od
      LEFT JOIN products p ON od.producto_id = p.id
      LEFT JOIN users u ON p.vendedor_id = u.id
      WHERE od.orden_id = ?
    `;
    const detalles = await executeQuery(queryDetalles, [id]);
    orden.detalles = detalles;

    return orden;
  }

  static async actualizarEstado(id, nuevoEstado, notas = null) {
    const estadosValidos = ["pendiente", "confirmada", "enviada", "entregada", "cancelada"];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error("Estado inválido");
    }

    let query = "UPDATE orders SET estado = ?";
    let params = [nuevoEstado];

    if (notas) {
      query += ", notas = ?";
      params.push(notas);
    }

    query += " WHERE id = ?";
    params.push(id);

    const resultado = await executeQuery(query, params);
    if (resultado.affectedRows === 0) {
      throw new Error("Orden no encontrada");
    }
    return await this.buscarPorId(id);
  }

  static async obtenerPorUsuario(usuarioId, rol) {
    let query;
    if (rol === "vendedor") {
      query = `
        SELECT DISTINCT o.*, u.nombre as comprador_nombre
        FROM orders o
        JOIN order_details od ON o.id = od.orden_id
        JOIN products p ON od.producto_id = p.id
        JOIN users u ON o.comprador_id = u.id
        WHERE p.vendedor_id = ?
        ORDER BY o.fecha_orden DESC
      `;
    } else {
      query = `
        SELECT o.*, u.nombre as comprador_nombre
        FROM orders o
        JOIN users u ON o.comprador_id = u.id
        WHERE o.comprador_id = ?
        ORDER BY o.fecha_orden DESC
      `;
    }
    return await executeQuery(query, [usuarioId]);
  }
}

module.exports = Pedido;
