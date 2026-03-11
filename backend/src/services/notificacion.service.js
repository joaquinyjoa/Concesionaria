const notificacionRepository = require('../repositories/notificacion.repository');

exports.crear = async (data) => {
    return await notificacionRepository.crear(data);
};

exports.getNoLeidas = async () => {
    return await notificacionRepository.getNoLeidas();
};

exports.marcarLeida = async (id) => {
    return await notificacionRepository.marcarLeida(id);
};

exports.marcarTodasLeidas = async () => {
    return await notificacionRepository.marcarTodasLeidas();
};