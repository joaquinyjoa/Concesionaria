const clienteService = require('../services/cliente.service');

exports.getById = async (req, res, next) => {
    try {
        const cliente = await clienteService.getById(req.params.id);
        res.status(200).json(cliente);
    } catch (error) {
        next(error);
    }
}

exports.getMe = async (req, res, next) => {
    try {
        const cliente = await clienteRepository.getById(req.usuario.id)
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
        res.json(cliente)
    } catch (e) { next(e) }
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

exports.getAll = async (req, res, next) => {
    try {
        const clientes = await clienteService.getAll();
        res.status(200).json(clientes);
    } catch (error) {
        next(error);
    }
}

exports.buscar = async (req, res, next) => {
    try {
        const { q } = req.query
        if (!q || q.trim().length < 2) return res.json([])
        const clientes = await clienteService.buscar(q.trim())
        res.json(clientes)
    } catch (error) {
        next(error);
    }
}