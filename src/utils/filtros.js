const parsearLista = (valor, tipo = 'string') => {
    if (!valor) return null;
    const lista = valor
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    switch (tipo) {
        case 'int':
            return lista.map((item) => parseInt(item)).filter((num) => !isNaN(num));
        case 'float':
            return lista.map((item) => parseFloat(item)).filter((num) => !isNaN(num));
        default:
            return lista;
    }
};

const parsearOrdenamiento = (orden) => {
    if (!orden) return [];
    const camposPermitidos = ['precio', 'fecha_creacion', 'nombre', 'stock', 'id'];
    return orden
        .split(',')
        .map((item) => {
            const [campo, direccion = 'desc'] = item.trim().split(':');
            return {
                campo: campo.toLowerCase(),
                direccion: direccion.toUpperCase(),
            };
        })
        .filter(
            (item) =>
                camposPermitidos.includes(item.campo) &&
                ['ASC', 'DESC'].includes(item.direccion)
        );
};

const construirFiltrosSQL = (filtros) => {
    const condiciones = [];
    const parametros = [];

    if (filtros.categorias && filtros.categorias.length > 0) {
        const placeholders = filtros.categorias.map(() => '?').join(',');
        condiciones.push(`p.categoria_id IN (${placeholders})`);
        parametros.push(...filtros.categorias);
    }

    if (filtros.precio) {
        if (filtros.precio.min !== undefined) {
            condiciones.push('p.precio >= ?');
            parametros.push(filtros.precio.min);
        }
        if (filtros.precio.max !== undefined) {
            condiciones.push('p.precio <= ?');
            parametros.push(filtros.precio.max);
        }
    }

    if (filtros.busqueda) {
        condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
        parametros.push(`%${filtros.busqueda}%`, `%${filtros.busqueda}%`);
    }

    return {
        whereClause:
            condiciones.length > 0 ? `AND ${condiciones.join(' AND ')}` : '',
        parametros,
    };
};

module.exports = {
    parsearLista,
    parsearOrdenamiento,
    construirFiltrosSQL,
};
