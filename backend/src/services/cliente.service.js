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

exports.delete = async (idCliente, usuarioLogueado) => {
    // el cliente solo puede borrarse a si mismo
    // el admin puede borrar a cualquiera
    if (usuarioLogueado.rol === 'cliente' && usuarioLogueado.id !== parseInt(idCliente)) {
        throw new Error('No tenés permisos para eliminar esta cuenta');
    }
    const cliente = await clienteRepository.getById(idCliente);
    if (!cliente) throw new Error('Cliente no encontrado');
    return await clienteRepository.delete(idCliente);
}

exports.getAll = async () => {
    return await clienteRepository.getAll();
}

exports.buscar = async (q) => {
    return clienteRepository.buscar(q)
}