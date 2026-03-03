const { executeQuery } = require("../config/database");
const { construirFiltrosSQL } = require("../utils/filtros");

class Usuario {
  static async crear(datosUsuario) {
    const { nombre, email, password, rol = "comprador" } = datosUsuario;
    const query = `
            INSERT INTO users (nombre, email, password, rol, fecha_registro)
            VALUES (?, ?, ?, ?, NOW())
        `;
    try {
      const resultado = await executeQuery(query, [
        nombre,
        email,
        password,
        rol,
      ]);
      return {
        id: resultado.insertId,
        nombre,
        email,
        rol,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("El email ya está registrado");
      }
      throw error;
    }
  }

  static async buscarPorEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";
    const usuarios = await executeQuery(query, [email]);
    return usuarios.length > 0 ? usuarios[0] : null;
  }

  static async buscarPorId(id) {
    const query =
      "SELECT id, nombre, email, rol, fecha_registro FROM users WHERE id = ?";
    const usuarios = await executeQuery(query, [id]);
    return usuarios.length > 0 ? usuarios[0] : null;
  }

  static async obtenerTodos(filtros = {}) {
    let query =
      "SELECT id, nombre, email, rol, fecha_registro FROM users WHERE 1=1";
    const params = [];

    const { whereClause, parametros } = construirFiltrosSQL({
      busqueda: filtros.busqueda
    });

    query += ` ${whereClause}`;
    params.push(...parametros);

    // Filtro por rol
    if (filtros.rol) {
      query += " AND rol = ?";
      params.push(filtros.rol);
    }

    // --- Desafío Autónomo: Filtros avanzados y paginación ---
    // Filtro por fecha (desde/hasta)
    if (filtros.desde) {
      query += " AND fecha_registro >= ?";
      params.push(filtros.desde);
    }
    if (filtros.hasta) {
      query += " AND fecha_registro <= ?";
      params.push(filtros.hasta);
    }

    // Ordenamiento dinámico
    const ordenPermitido = ["nombre", "email", "fecha_registro", "rol"];
    const ordenCampo = ordenPermitido.includes(filtros.orden)
      ? filtros.orden
      : "fecha_registro";
    const ordenDir = filtros.dir === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY ${ordenCampo} ${ordenDir}`;

    // Paginación
    const limite = parseInt(filtros.limite) || 10;
    const offset = (parseInt(filtros.pagina) - 1) * limite || 0;
    query += " LIMIT ? OFFSET ?";
    params.push(limite, offset);

    return await executeQuery(query, params);
  }

  // --- Desafío Autónomo: PUT y DELETE ---
  static async actualizar(id, datosActualizados) {
    const query = "UPDATE users SET nombre = ?, rol = ? WHERE id = ?";
    const { nombre, rol } = datosActualizados;
    const resultado = await executeQuery(query, [nombre, rol, id]);
    if (resultado.affectedRows === 0) {
      throw new Error("Usuario no encontrado");
    }
    return await this.buscarPorId(id);
  }

  static async actualizarPassword(id, nuevaPassword) {
    const query = "UPDATE users SET password = ? WHERE id = ?";
    return await executeQuery(query, [nuevaPassword, id]);
  }

  static async eliminar(id) {
    const query = "DELETE FROM users WHERE id = ?";
    const resultado = await executeQuery(query, [id]);
    if (resultado.affectedRows === 0) {
      throw new Error("Usuario no encontrado");
    }
    return { eliminado: true };
  }
}

module.exports = Usuario;
