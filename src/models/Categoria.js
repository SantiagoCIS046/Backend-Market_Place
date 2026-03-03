const { executeQuery } = require("../config/database");

class Categoria {
  static async crear(datos) {
    const { nombre, descripcion, imagen_icono } = datos;
    const query =
      "INSERT INTO categories (nombre, descripcion, imagen_icono, fecha_creacion) VALUES (?, ?, ?, NOW())";
    const resultado = await executeQuery(query, [
      nombre,
      descripcion,
      imagen_icono,
    ]);
    return { id: resultado.insertId, ...datos };
  }

  static async obtenerTodas() {
    const query = "SELECT * FROM categories ORDER BY nombre ASC";
    return await executeQuery(query);
  }

  static async buscarPorId(id) {
    const query = "SELECT * FROM categories WHERE id = ?";
    const filas = await executeQuery(query, [id]);
    return filas.length > 0 ? filas[0] : null;
  }

  static async actualizar(id, datos) {
    const { nombre, descripcion, imagen_icono } = datos;
    const query =
      "UPDATE categories SET nombre = ?, descripcion = ?, imagen_icono = ? WHERE id = ?";
    await executeQuery(query, [nombre, descripcion, imagen_icono, id]);
    return this.buscarPorId(id);
  }

  static async eliminar(id) {
    const query = "DELETE FROM categories WHERE id = ?";
    await executeQuery(query, [id]);
    return { eliminado: true };
  }

  static async obtenerEstadisticas() {
    const query = `
      SELECT 
        c.id, c.nombre, 
        COUNT(p.id) as total_productos,
        COALESCE(SUM(p.stock), 0) as stock_total,
        COALESCE(AVG(p.precio), 0) as precio_promedio
      FROM categories c
      LEFT JOIN products p ON c.id = p.categoria_id
      GROUP BY c.id, c.nombre
    `;
    return await executeQuery(query);
  }

  static async obtenerProductos(id, filtros = {}) {
    let query = "SELECT * FROM products WHERE categoria_id = ?";
    const params = [id];

    if (filtros.minPrice) {
      query += " AND precio >= ?";
      params.push(filtros.minPrice);
    }
    if (filtros.maxPrice) {
      query += " AND precio <= ?";
      params.push(filtros.maxPrice);
    }

    const limite = parseInt(filtros.limite) || 10;
    const offset = (parseInt(filtros.pagina) - 1) * limite || 0;
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);

    return await executeQuery(query, params);
  }
}

module.exports = Categoria;
