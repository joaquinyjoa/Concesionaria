const ventaRepository = require('../repositories/venta.repository');
const vehiculoRepository = require('../repositories/vehiculo.repository');
const clienteRepository = require('../repositories/cliente.repository');
const empleadoRepository = require('../repositories/empleado.repository');
const { validarVenta } = require('../utils/venta.validator');

exports.create = async (data, usuario) => {
    // Obtener empleado_id desde el token automáticamente
    const empleado = await empleadoRepository.getByUsuarioId(usuario.id);
    if (!empleado) throw new Error('No se encontró el empleado asociado a este usuario');

    const payload = { ...data, empleado_id: empleado.id };

    const errores = validarVenta(payload);
    if (errores.length > 0) throw new Error(errores.join(', '));

    const vehiculo = await vehiculoRepository.getById(payload.vehiculo_id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    if (!['disponible', 'reservado'].includes(vehiculo.estado?.toLowerCase())) {
        throw new Error('El vehículo no está disponible para la venta');
    }

    const cliente = await clienteRepository.getById(payload.cliente_id);
    if (!cliente) throw new Error('Cliente no encontrado');

    const venta = await ventaRepository.create(payload);

    await vehiculoRepository.update(payload.vehiculo_id, { ...vehiculo, estado: 'vendido' });

    return venta;
}

exports.getAll = async (usuario) => {
    if (usuario.rol === 'admin') {
        return await ventaRepository.getAll();
    }
    // Empleado: solo sus ventas
    const empleado = await empleadoRepository.getByUsuarioId(usuario.id);
    if (!empleado) return [];
    return await ventaRepository.getAllByEmpleado(empleado.id);
}

exports.getById = async (id) => {
    const venta = await ventaRepository.getById(id);
    if (!venta) throw new Error('Venta no encontrada');
    return venta;
}

exports.getAllByCliente = async (cliente_id) => {
    return await ventaRepository.getAllByCliente(cliente_id);
}