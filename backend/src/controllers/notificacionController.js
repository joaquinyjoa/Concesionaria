const notificacionService = require('../services/notificacion.service');

exports.getNoLeidas = async (req, res, next) => {
    try {
        const notificaciones = await notificacionService.getNoLeidas();
        res.status(200).json(notificaciones);
    } catch (error) {
        next(error);
    }
};

exports.marcarLeida = async (req, res, next) => {
    try {
        const notificacion = await notificacionService.marcarLeida(req.params.id);
        res.status(200).json(notificacion);
    } catch (error) {
        next(error);
    }
};

exports.marcarTodasLeidas = async (req, res, next) => {
    try {
        await notificacionService.marcarTodasLeidas();
        res.status(200).json({ message: 'Todas marcadas como leídas' });
    } catch (error) {
        next(error);
    }
};