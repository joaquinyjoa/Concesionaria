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

exports.delete = async (id) => {
    const result = await pool.query(
        'DELETE FROM vehiculos WHERE id = $1 RETURNING *', [id]
    );
    return result.rows[0];
}