const pool = require('../config/database');

exports.create = async (vehiculo_id, url) => {
    const query = `INSERT INTO imagenes (vehiculo_id, url)
        VALUES ($1, $2)
        RETURNING *`;

    const result = await pool.query(query, [vehiculo_id, url]);
    return result.rows[0];
}

exports.getByVehiculoId = async (vehiculo_id) => {
    const result = await pool.query(
        'SELECT * FROM imagenes WHERE vehiculo_id = $1', [vehiculo_id]
    );
    return result.rows;
}

exports.delete = async (id) => {
    const result = await pool.query(
        'DELETE FROM imagenes WHERE id = $1 RETURNING *', [id]
    );
    return result.rows[0];
}

exports.getById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM imagenes WHERE id = $1', [id]
    );
    return result.rows[0];
}