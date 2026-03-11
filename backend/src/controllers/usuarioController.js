const usuarioService = require('../services/usuario.service');

exports.register = async (req, res, next) => {
    try {
        const usuario = await usuarioService.register(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
}

// solo el admin puede usar este endpoint
exports.crearEmpleado = async (req, res, next) => {
    try {
        const empleado = await usuarioService.crearEmpleado(req.body);
        res.status(201).json(empleado);
    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const { token, rol, id } = await usuarioService.login(req.body);
        res.status(200).json({ token, rol, id });
    } catch (error) {
        next(error);
    }
}

exports.verificarCuenta = async (req, res, next) => {
    try {
        const result = await usuarioService.verificarCuenta(req.query.token);
        res.status(200).json(result);
    } catch (error) { next(error); }
}

exports.solicitarReset = async (req, res, next) => {
    try {
        const result = await usuarioService.solicitarReset(req.body.email);
        res.status(200).json(result);
    } catch (error) { next(error); }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const result = await usuarioService.resetPassword(req.body.token, req.body.nuevaPassword);
        res.status(200).json(result);
    } catch (error) { next(error); }
}

exports.cambiarPassword = async (req, res, next) => {
    try {
        const result = await usuarioService.cambiarPassword(req.usuario.id, req.body.passwordActual, req.body.nuevaPassword);
        res.status(200).json(result);
    } catch (error) { next(error); }
}