const pool = require('../config/database');

exports.create = async (id, data) => {
    const { nombre, apellido, documento, localidad, telefono, fecha_nacimiento } = data;

    const query = `INSERT INTO clientes 
        (id, nombre, apellido, documento, localidad, telefono, fecha_nacimiento)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;

    const params = [id, nombre, apellido, documento, localidad, telefono, fecha_nacimiento];
    const result = await pool.query(query, params);
    return result.rows[0];
}

exports.getById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM clientes WHERE id = $1', [id]
    );
    return result.rows[0];
}

exports.update = async (id, data) => {
    const { nombre, apellido, documento, localidad, telefono, fecha_nacimiento } = data;

    const query = `UPDATE clientes SET
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
        'DELETE FROM clientes WHERE id = $1 RETURNING id', [id]
    );
    return result.rows[0];
}

exports.getAll = async () => {
    const result = await pool.query(
        `SELECT c.*, u.email FROM clientes c
         JOIN usuarios u ON u.id = c.id
         ORDER BY c.apellido, c.nombre`
    );
    return result.rows;
}

exports.buscar = async (q) => {
    const result = await pool.query(
        `SELECT id, nombre, apellido, documento, email, telefono, localidad
         FROM clientes
         WHERE LOWER(nombre || ' ' || apellido) LIKE LOWER($1)
            OR documento LIKE $1
         LIMIT 10`,
        [`%${q}%`]
    )
    return result.rows
}