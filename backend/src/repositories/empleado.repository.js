const pool = require('../config/database');

exports.create = async (id, data) => {
    const { nombre, apellido, documento, localidad, telefono, fecha_nacimiento } = data;

    const query = `INSERT INTO empleados 
        (id, nombre, apellido, documento, localidad, telefono, fecha_nacimiento)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;

    const params = [id, nombre, apellido, documento, localidad, telefono, fecha_nacimiento];
    const result = await pool.query(query, params);
    return result.rows[0];
}

exports.getById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM empleados WHERE id = $1', [id]
    );
    return result.rows[0];
}

exports.update = async (id, data) => {
    const { nombre, apellido, documento, localidad, telefono, fecha_nacimiento } = data;

    const query = `UPDATE empleados SET
        nombre = $1, apellido = $2, documento = $3,
        localidad = $4, telefono = $5, fecha_nacimiento = $6
        WHERE id = $7
        RETURNING *`;

    const params = [nombre, apellido, documento, localidad, telefono, fecha_nacimiento, id];
    const result = await pool.query(query, params);
    return result.rows[0];
}

exports.delete = async (id) => {
    const result = await pool.query(
        'DELETE FROM empleados WHERE id = $1 RETURNING id', [id]
    );
    return result.rows[0];
}