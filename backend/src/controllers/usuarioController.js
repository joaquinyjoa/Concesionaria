const usuarioService = require('../services/usuario.service');

exports.register = async (req, res, next) => {
    try {
        const usuario = await usuarioService.register(req.body);
        res.status(201).json(usuario);
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