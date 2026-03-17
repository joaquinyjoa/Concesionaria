const vehiculoRepository = require("../repositories/vehiculo.repository");
const notificacionService = require('./notificacion.service');
const { validarVehiculo } = require("../utils/vehiculo.validator");
const pool = require('../config/database');

exports.getAll = async () => {
    return await vehiculoRepository.getAll();
}

exports.getById = async (id) => {
    const vehiculo = await vehiculoRepository.getById(id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    return vehiculo;
}

exports.create = async (data) => {

    const errores = validarVehiculo(data);

    if (errores.length > 0) {
        throw new Error(errores.join(", "));
    }

    return await vehiculoRepository.create(data);
};

exports.update = async (id, data) => {
    const errores = validarVehiculo(data);
    if (errores.length > 0) {
        throw new Error(errores.join(", "));
    }

    const vehiculo = await vehiculoRepository.getById(id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    
    return await vehiculoRepository.update(id, data);
}

exports.reservar = async (id, usuario) => {
    const vehiculo = await vehiculoRepository.getById(id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    if (vehiculo.estado.toLowerCase() !== 'disponible') {
        throw new Error('El vehículo no está disponible para reservar');
    }

    // Obtener cliente desde el usuario logueado
    const clienteResult = await pool.query(
        `SELECT id FROM clientes WHERE usuario_id = $1`, [usuario.id]
    );
    const cliente = clienteResult.rows[0];
    if (!cliente) throw new Error('No se encontró el cliente asociado');

    // Cambiar estado y guardar quién reservó
    await pool.query(
        `UPDATE vehiculos SET estado = 'reservado', reservado_por = $1 WHERE id = $2`,
        [cliente.id, id]
    );

    // Crear notificación para los empleados
    await notificacionService.crear({
        tipo: 'reserva',
        mensaje: `reservó el vehículo`,
        vehiculo_id: id,
        cliente_id: cliente.id,
    });

    return await vehiculoRepository.getById(id);
};

exports.cancelarReserva = async (id) => {
    const vehiculo = await vehiculoRepository.getById(id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    if (vehiculo.estado.toLowerCase() !== 'reservado') {
        throw new Error('El vehículo no está reservado');
    }
    await pool.query(
        `UPDATE vehiculos SET estado = 'disponible', reservado_por = NULL WHERE id = $1`,
        [id]
    );
    return await vehiculoRepository.getById(id);
};

exports.getByFiltros = async (filtros) => {
    return await vehiculoRepository.getByFiltros(filtros);
}

exports.delete = async (id) => {
    // verificar si tiene ventas
    const ventas = await pool.query('SELECT id FROM ventas WHERE vehiculo_id = $1 LIMIT 1', [id])
    if (ventas.rows.length > 0) {
        throw new Error('No se puede eliminar un vehículo que tiene ventas registradas')
    }
    return await vehiculoRepository.delete(id)
}