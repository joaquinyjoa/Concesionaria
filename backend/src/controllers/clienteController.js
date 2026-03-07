const clienteService = require('../services/cliente.service');

exports.getById = async (req, res, next) => {
    try {
        const cliente = await clienteService.getById(req.params.id);
        res.status(200).json(cliente);
    } catch (error) {
        next(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const cliente = await clienteService.update(req.params.id, req.body);
        res.status(200).json(cliente);
    } catch (error) {
        next(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        await clienteService.delete(req.params.id, req.usuario); // req.usuario viene del middleware auth
        res.status(200).json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        next(error);
    }
}