module.exports = (req, res, next) => {
    const rol = req.usuario?.rol;
    if (rol === 'admin') return next();
    res.status(403).json({ error: 'Se requiere rol de administrador' });
}