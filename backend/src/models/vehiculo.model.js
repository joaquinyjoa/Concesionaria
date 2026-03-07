const pool = require('../config/database');

async function crearVehiculo(vehiculo) {
    const { tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, precio } = vehiculo; 

    const query = `INSERT INTO vehiculos 
        (tipo, marca, modelo, motor, anio, kilometraje, condicion, estado, precio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`;
    
    const params = [tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, precio];

    try {
        const result = await pool.query(query, params);
        return result.rows[0].id; // así se obtiene el id en pg
    } catch (error) {
        console.error('Error al crear el vehículo:', error);
        throw error;
    }
}

module.exports = { crearVehiculo };