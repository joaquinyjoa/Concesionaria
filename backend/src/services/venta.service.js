const ventaRepository = require('../repositories/venta.repository');
const vehiculoRepository = require('../repositories/vehiculo.repository');
const clienteRepository = require('../repositories/cliente.repository');
const empleadoRepository = require('../repositories/empleado.repository');
const { validarVenta } = require('../utils/venta.validator');

exports.create = async (data) => {
    const errores = validarVenta(data);
    if (errores.length > 0) throw new Error(errores.join(', '));

    const vehiculo = await vehiculoRepository.getById(data.vehiculo_id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    if (vehiculo.estado.toLowerCase() !== 'reservado') { 
        throw new Error('El vehículo debe estar reservado antes de venderse');
    }

    const cliente = await clienteRepository.getById(data.cliente_id);
    if (!cliente) throw new Error('Cliente no encontrado');

    const empleado = await empleadoRepository.getById(data.empleado_id);
    if (!empleado) throw new Error('Empleado no encontrado');

    const venta = await ventaRepository.create(data);

    await vehiculoRepository.update(data.vehiculo_id, { ...vehiculo, estado: 'vendido' });

    return venta;
}

exports.getAll = async () => {
    return await ventaRepository.getAll();
}

exports.getById = async (id) => {
    const venta = await ventaRepository.getById(id);
    if (!venta) throw new Error('Venta no encontrada');
    return venta;
}

