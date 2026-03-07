const empleadoRepository = require('../repositories/empleado.repository');
const { validarEmpleado } = require('../utils/empleado.validator');

exports.getById = async (id) => {
    const empleado = await empleadoRepository.getById(id);
    if (!empleado) throw new Error('Empleado no encontrado');
    return empleado;
}

exports.update = async (id, data) => {
    const errores = validarEmpleado(data);
    if (errores.length > 0) throw new Error(errores.join(', '));

    const empleado = await empleadoRepository.getById(id);
    if (!empleado) throw new Error('Empleado no encontrado');

    return await empleadoRepository.update(id, data);
}

exports.delete = async (id) => {
    const empleado = await empleadoRepository.getById(id);
    if (!empleado) throw new Error('Empleado no encontrado');
    return await empleadoRepository.delete(id);
}