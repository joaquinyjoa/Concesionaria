const pool = require('../config/database');

exports.create = async (data) => {
    const { email, password, rol } = data;

    const query = `INSERT INTO usuarios (email, password, rol)
        VALUES ($1, $2, $3)
        RETURNING id, email, rol, fecha_registro`;

    const result = await pool.query(query, [email, password, rol]);
    return result.rows[0];
}

exports.getByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1', [email]
    );
    return result.rows[0];
}

exports.getById = async (id) => {
    const result = await pool.query(
        'SELECT id, email, rol, fecha_registro FROM usuarios WHERE id = $1', [id]
    );
    return result.rows[0];
}

exports.update = async (id, data) => {
    const { email, password } = data;

    const query = `UPDATE usuarios SET
        email = $1, password = $2
        WHERE id = $3
        RETURNING id, email, rol, fecha_registro`;

    const result = await pool.query(query, [email, password, id]);
    return result.rows[0];
}

exports.delete = async (id) => {
    const result = await pool.query(
        'DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]
    );
    return result.rows[0];
}