const ventaService = require('../services/venta.service');

exports.create = async (req, res, next) => {
    try {
        const venta = await ventaService.create(req.body, req.usuario);
        res.status(201).json(venta);
    } catch (error) {
        next(error);
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const ventas = await ventaService.getAll(req.usuario);
        res.status(200).json(ventas);
    } catch (error) {
        next(error);
    }
}

exports.getById = async (req, res, next) => {
    try {
        const venta = await ventaService.getById(req.params.id);
        res.status(200).json(venta);
    } catch (error) {
        next(error);
    }
}

exports.getAllByCliente = async (req, res, next) => {
    try {
        const ventas = await ventaService.getAllByCliente(req.params.cliente_id);
        res.status(200).json(ventas);
    } catch (error) {
        next(error);
    }
}