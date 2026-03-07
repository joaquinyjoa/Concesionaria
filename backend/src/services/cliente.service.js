const clienteRepository = require('../repositories/cliente.repository');
const { validarCliente } = require('../utils/cliente.validator');

exports.getById = async (id) => {
    const cliente = await clienteRepository.getById(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    return cliente;
}

exports.update = async (id, data) => {
    const errores = validarCliente(data);
    if (errores.length > 0) throw new Error(errores.join(', '));

    const cliente = await clienteRepository.getById(id);
    if (!cliente) throw new Error('Cliente no encontrado');

    return await clienteRepository.update(id, data);
}

exports.delete = async (id) => {
    const cliente = await clienteRepository.getById(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    return await clienteRepository.delete(id);
}