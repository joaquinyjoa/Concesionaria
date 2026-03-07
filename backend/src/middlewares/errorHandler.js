//manejo de errores globales
function errorHandler(err, req, res, next) {
    if (err.message === 'Vehículo no encontrado') {
        return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('Falta el campo')) {
        return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;