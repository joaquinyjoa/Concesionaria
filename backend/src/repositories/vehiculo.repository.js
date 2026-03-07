const pool = require('../config/database');

exports.create = async (data) => {
    const { tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, precio } = data;

    const query = `INSERT INTO vehiculos 
        (tipo, marca, modelo, motor, anio, kilometraje, condicion, estado, precio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`;

    const params = [tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, precio];

    const result = await pool.query(query, params);
    return result.rows[0].id;
}