module.exports = (req, res, next) => {
    const rol = req.usuario?.rol;
    if (rol === 'empleado' || rol === 'admin') return next();
    res.status(403).json({ error: 'No tenés permisos para realizar esta acción' });
}