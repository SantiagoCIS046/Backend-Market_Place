const { executeQuery } = require("../config/database");
const { construirFiltrosSQL } = require("../utils/filtros");

class Producto {
  static async crear(datosProducto) {
    const {
      vendedor_id,
      categoria_id,
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
    } = datosProducto;
    const query = `
            INSERT INTO products 
            (vendedor_id, categoria_id, nombre, descripcion, precio, stock, imagen_url, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
    try {
      const resultado = await executeQuery(query, [
        vendedor_id,
        categoria_id,
        nombre,
        descripcion,
        precio,
        stock,
        imagen_url,
      ]);
      return {
        id: resultado.insertId,
        ...datosProducto,
      };
    } catch (error) {
      throw error;
    }
  }

  static async buscarPorId(id) {
    const query = `
            SELECT 
                p.*, 
                u.nombre as vendedor_nombre, 
                u.email as vendedor_email,
                c.nombre as categoria_nombre
            FROM products p
            LEFT JOIN users u ON p.vendedor_id = u.id
            LEFT JOIN categories c ON p.categoria_id = c.id
            WHERE p.id = ?
        `;
    const productos = await executeQuery(query, [id]);
    if (productos.length === 0) return null;

    const producto = productos[0];
    producto.imagenes = await this.obtenerImagenes(id);
    return producto;
  }

  static async obtenerConFiltros(filtros = {}) {
    let query = `
            SELECT 
                p.id, p.nombre, p.descripcion, p.precio, p.stock, 
                p.imagen_url, p.fecha_creacion,
                u.nombre as vendedor_nombre,
                c.nombre as categoria_nombre
            FROM products p
            LEFT JOIN users u ON p.vendedor_id = u.id
            LEFT JOIN categories c ON p.categoria_id = c.id
            WHERE 1=1
        `;
    const params = [];

    const { whereClause, parametros } = construirFiltrosSQL({
      categorias: filtros.categoria_id ? [filtros.categoria_id] : null,
      precio: { min: filtros.precio_min, max: filtros.precio_max },
      busqueda: filtros.busqueda,
    });

    query += ` ${whereClause}`;
    params.push(...parametros);

    if (filtros.vendedor_id) {
      query += " AND p.vendedor_id = ?";
      params.push(filtros.vendedor_id);
    }
    if (filtros.en_stock === "true") {
      query += " AND p.stock > 0";
    }

    query += " ORDER BY p.fecha_creacion DESC";

    const limite = Math.min(parseInt(filtros.limite) || 10, 50);
    const offset = (parseInt(filtros.pagina) - 1) * limite || 0;
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);

    return await executeQuery(query, params);
  }

  static async actualizar(id, datosActualizados) {
    const camposPermitidos = [
      "nombre",
      "descripcion",
      "precio",
      "stock",
      "categoria_id",
      "imagen_url",
    ];
    const campos = [];
    const valores = [];

    Object.keys(datosActualizados).forEach((campo) => {
      if (
        camposPermitidos.includes(campo) &&
        datosActualizados[campo] !== undefined
      ) {
        campos.push(`${campo} = ?`);
        valores.push(datosActualizados[campo]);
      }
    });

    if (campos.length === 0) {
      throw new Error("No hay campos válidos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE products SET ${campos.join(", ")} WHERE id = ?`;
    const resultado = await executeQuery(query, valores);

    if (resultado.affectedRows === 0) {
      throw new Error("Producto no encontrado");
    }
    return await this.buscarPorId(id);
  }

  static async eliminar(id) {
    const query = "DELETE FROM products WHERE id = ?";
    const resultado = await executeQuery(query, [id]);
    if (resultado.affectedRows === 0) {
      throw new Error("Producto no encontrado");
    }
    return { eliminado: true };
  }

  static async agregarImagen(productoId, url, esPrincipal = false) {
    const query = "INSERT INTO product_images (producto_id, imagen_url, es_principal) VALUES (?, ?, ?)";
    return await executeQuery(query, [productoId, url, esPrincipal]);
  }

  static async obtenerImagenes(productoId) {
    const query = "SELECT * FROM product_images WHERE producto_id = ?";
    return await executeQuery(query, [productoId]);
  }
}

module.exports = Producto;
