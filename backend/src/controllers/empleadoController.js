const empleadoService = require('../services/empleado.service');

exports.getById = async (req, res, next) => {
    try {
        const empleado = await empleadoService.getById(req.params.id);
        res.status(200).json(empleado);
    } catch (error) {
        next(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const empleado = await empleadoService.update(req.params.id, req.body);
        res.status(200).json(empleado);
    } catch (error) {
        next(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        await empleadoService.delete(req.params.id, req.usuario);
        res.status(200).json({ message: 'Empleado eliminado correctamente' });
    } catch (error) {
        next(error);
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const empleados = await empleadoService.getAll();
        res.status(200).json(empleados);
    } catch (error) {
        next(error);
    }
}