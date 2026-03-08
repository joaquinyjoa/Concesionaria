const vehiculoService = require("../services/vehiculo.service");

exports.getVehiculos = async (req, res, next) => {
    try {
        const vehiculos = await vehiculoService.getAll();
        res.status(200).json(vehiculos);
    } catch (error) {
        next(error);
    }
}

exports.getVehiculoById = async (req, res, next) => {
    try {
        const vehiculo = await vehiculoService.getById(req.params.id);
        res.status(200).json(vehiculo);
    }catch (error) {
        next(error);
    }
}

exports.createVehiculo = async (req, res, next) => {
    try{
        const id = await vehiculoService.create(req.body);
        res.status(201).json({ id });
    }catch (error) {
        next(error);
    }
}

exports.updateVehiculo = async (req, res, next) => {
    try {
        const vehiculo = await vehiculoService.update(req.params.id, req.body);
        res.status(200).json(vehiculo);
    } catch (error) {
        next(error);
    }
}

exports.reservar = async (req, res, next) => {
    try {
        const vehiculo = await vehiculoService.reservar(req.params.id);
        res.status(200).json(vehiculo);
    } catch (error) {
        next(error);
    }
}

exports.cancelarReserva = async (req, res, next) => {
    try {
        const vehiculo = await vehiculoService.cancelarReserva(req.params.id);
        res.status(200).json(vehiculo);
    } catch (error) {
        next(error);
    }
}

exports.getVehiculos = async (req, res, next) => {
    try {
        const tieneFiltros = Object.keys(req.query).length > 0;
        if (tieneFiltros) {
            const vehiculos = await vehiculoService.getByFiltros(req.query);
            return res.status(200).json(vehiculos);
        }
        const vehiculos = await vehiculoService.getAll();
        res.status(200).json(vehiculos);
    } catch (error) {
        next(error);
    }
}

exports.deleteVehiculo = async (req, res, next) => {
    try {
        await vehiculoService.delete(req.params.id);
        res.status(200).json({ message: 'Vehículo eliminado correctamente' });
    } catch (error) {
        next(error);
    }
}