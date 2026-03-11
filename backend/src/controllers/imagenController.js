const imagenService = require('../services/imagen.service');

exports.create = async (req, res, next) => {
    try {
        console.log('req.file:', req.file)
        console.log('req.body:', req.body)
        console.log('headers:', req.headers['content-type'])
        if (!req.file) throw new Error('No se envió ninguna imagen');
        const imagen = await imagenService.create(req.params.vehiculo_id, req.file);
        res.status(201).json(imagen);
    } catch (error) {
        console.log('ERROR imagen:', error.message)
        next(error);
    }
}

exports.getByVehiculoId = async (req, res, next) => {
    try {
        const imagenes = await imagenService.getByVehiculoId(req.params.vehiculo_id);
        res.status(200).json(imagenes);
    } catch (error) {
        next(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        await imagenService.delete(req.params.id);
        res.status(200).json({ message: 'Imagen eliminada correctamente' });
    } catch (error) {
        next(error);
    }
}