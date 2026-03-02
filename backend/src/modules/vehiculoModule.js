const db = require('../config/database');

// Función para crear un nuevo vehículo en la base de datos
async function crearVehiculo(vehiculo) {
    // Desestructuramos el objeto vehiculo para obtener sus propiedades
    const {id, tipo, marca, modelo, motor, año,
        kilometraje, condicion, estado, precio} = vehiculo;
    
    // Consulta SQL para insertar un nuevo vehículo en la tabla "vehiculos"
    const query = 'INSERT INTO vehiculos \
    (id, tipo, marca, modelo, motor, año, kilometraje, condicion, estado, precio)\
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [id, tipo, marca, modelo, motor, año,
         kilometraje, condicion, estado, precio];

    try {
        const dbConnection = await db();
        // Ejecutamos la consulta SQL con los parámetros proporcionados y obtenemos el ID del nuevo vehículo insertado
        const result = await dbConnection.run(query, params);
        return result.lastID;
    } catch (error) {
        console.error('Error al crear el vehículo:', error);
        throw error;
    }
}

module.exports = {
    crearVehiculo
};