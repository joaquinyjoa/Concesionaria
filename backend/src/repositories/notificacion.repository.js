const pool = require('../config/database');

exports.crear = async ({ tipo, mensaje, vehiculo_id, cliente_id }) => {
    const result = await pool.query(
        `INSERT INTO notificaciones (tipo, mensaje, vehiculo_id, cliente_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [tipo, mensaje, vehiculo_id, cliente_id]
    );
    return result.rows[0];
};

exports.getNoLeidas = async () => {
    const result = await pool.query(
        `SELECT n.*,
            v.marca, v.modelo,
            c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
            c.telefono AS cliente_telefono,
            u.email AS cliente_email
         FROM notificaciones n
         JOIN vehiculos v ON n.vehiculo_id = v.id
         JOIN clientes  c ON n.cliente_id  = c.id
         JOIN usuarios  u ON c.id = u.id
         WHERE n.leida = false
         ORDER BY n.created_at DESC`
    );
    return result.rows;
};

exports.marcarLeida = async (id) => {
    const result = await pool.query(
        `UPDATE notificaciones SET leida = true WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
};

exports.marcarTodasLeidas = async () => {
    await pool.query(`UPDATE notificaciones SET leida = true WHERE leida = false`);
};