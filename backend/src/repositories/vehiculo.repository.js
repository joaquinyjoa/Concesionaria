const pool = require('../config/database');

exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM vehiculos');
    return result.rows;
}

//obtener solo un vehiculo
exports.getById = async (id) => {
    const result = await pool.query('SELECT * FROM vehiculos WHERE id = $1', [id]);
    return result.rows[0];
}

//crecion del vehiculo
exports.create = async (data) => {
    const { tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, descripcion, precio } = data;

    const query = `INSERT INTO vehiculos 
        (tipo, marca, modelo, motor, anio, kilometraje, condicion, estado, descripcion, precio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`;

    const params = [tipo, marca, modelo, motor, anio,
         kilometraje, condicion, estado, descripcion, precio];

    const result = await pool.query(query, params);
    return result.rows[0].id;
}

//actualizacion del vheiculo
exports.update = async (id, data) => {
    const { tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, descripcion, precio } = data;

    const query = `UPDATE vehiculos SET
        tipo = $1, marca = $2, modelo = $3, motor = $4,
        anio = $5, kilometraje = $6, condicion = $7,
        estado = $8, descripcion = $9, precio = $10
        WHERE id = $11
        RETURNING *`;

    const params = [tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, descripcion, precio, id];

    const result = await pool.query(query, params);
    return result.rows[0];
}

exports.getByFiltros = async (filtros) => {
    const { tipo, marca, modelo, motor, anio, kilometraje, estado, condicion } = filtros;

    let query = 'SELECT * FROM vehiculos WHERE 1=1';
    const params = [];
    let i = 1;

    if (tipo) { query += ` AND tipo ILIKE $${i}`; params.push(`%${tipo}%`); i++; }
    if (marca) { query += ` AND marca ILIKE $${i}`; params.push(`%${marca}%`); i++; }
    if (modelo) { query += ` AND modelo ILIKE $${i}`; params.push(`%${modelo}%`); i++; }
    if (motor) { query += ` AND motor ILIKE $${i}`; params.push(`%${motor}%`); i++; }
    if (anio) { query += ` AND anio = $${i}`; params.push(anio); i++; }
    if (kilometraje) { query += ` AND kilometraje <= $${i}`; params.push(kilometraje); i++; }
    if (estado) { query += ` AND estado ILIKE $${i}`; params.push(`%${estado}%`); i++; }
    if (condicion) { query += ` AND condicion ILIKE $${i}`; params.push(`%${condicion}%`); i++; }

    const result = await pool.query(query, params);
    return result.rows;
}

exports.updateEstado = async (id, estado) => {
    const result = await pool.query(
        `UPDATE vehiculos SET estado = $1 WHERE id = $2 RETURNING *`,
        [estado, id]
    );
    return result.rows[0];
}

exports.delete = async (id) => {
    const result = await pool.query(
        'DELETE FROM vehiculos WHERE id = $1 RETURNING *', [id]
    );
    return result.rows[0];
}