const usuarioRepository = require('../repositories/usuario.repository');
const clienteRepository = require('../repositories/cliente.repository');
const empleadoRepository = require('../repositories/empleado.repository');
const { validarRegistro, validarLogin, validarCrearEmpleado } = require('../utils/usuario.validator');
const { validarCliente } = require('../utils/cliente.validator');
const { validarEmpleado } = require('../utils/empleado.validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enviarVerificacion, enviarResetPassword } = require('../utils/email');

exports.register = async (data) => {
    // validar usuario
    const erroresUsuario = validarRegistro(data);
    if (erroresUsuario.length > 0) throw new Error(erroresUsuario.join(', '));

    // verificar si el email ya existe
    const usuarioExistente = await usuarioRepository.getByEmail(data.email);
    if (usuarioExistente) throw new Error('El email ya está registrado');

    // validar datos personales según rol
    if (data.rol.toLowerCase() === 'cliente') {
        const erroresCliente = validarCliente(data);
        if (erroresCliente.length > 0) throw new Error(erroresCliente.join(', '));
    } else if (data.rol.toLowerCase() === 'empleado') {
        const erroresEmpleado = validarEmpleado(data);
        if (erroresEmpleado.length > 0) throw new Error(erroresEmpleado.join(', '));
    }

    // hashear la contraseña
    const hash = await bcrypt.hash(data.password, 10);

    // crear usuario
    const nuevoUsuario = await usuarioRepository.create({
        email: data.email,
        password: hash,
        rol: data.rol.toLowerCase()
    });

    const datosPersonales = {
        nombre: data.nombre,
        apellido: data.apellido,
        documento: data.documento,
        localidad: data.localidad,
        telefono: data.telefono,
        fecha_nacimiento: data.fecha_nacimiento
    };

    // crear cliente o empleado según rol
    if (data.rol.toLowerCase() === 'cliente') {
        const nuevoCliente = await clienteRepository.create(nuevoUsuario.id, datosPersonales);
        return { ...nuevoUsuario, ...nuevoCliente };
    } else if (data.rol.toLowerCase() === 'empleado') {
        const nuevoEmpleado = await empleadoRepository.create(nuevoUsuario.id, datosPersonales);
        return { ...nuevoUsuario, ...nuevoEmpleado };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hs

    await usuarioRepository.setResetToken(nuevoUsuario.id, token, expira);
    await enviarVerificacion(data.email, token);

    return { mensaje: 'Cuenta creada. Revisá tu email para verificarla.' };
}

// Verificar cuenta
exports.verificarCuenta = async (token) => {
    const usuario = await usuarioRepository.getByResetToken(token);
    if (!usuario) throw new Error('Token inválido o expirado');
    if (new Date() > new Date(usuario.reset_token_expira)) throw new Error('El link expiró');

    await usuarioRepository.verificar(usuario.id);
    return { mensaje: 'Cuenta verificada correctamente' };
}

// Solicitar reset de contraseña
exports.solicitarReset = async (email) => {
    const usuario = await usuarioRepository.getByEmail(email);
    if (!usuario) return { mensaje: 'Si el email existe, recibirás un link.' } // no revelar si existe

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await usuarioRepository.setResetToken(usuario.id, token, expira);
    await enviarResetPassword(email, token);

    return { mensaje: 'Si el email existe, recibirás un link.' }
}

// Confirmar nueva contraseña
exports.resetPassword = async (token, nuevaPassword) => {
    const usuario = await usuarioRepository.getByResetToken(token);
    if (!usuario) throw new Error('Token inválido o expirado');
    if (new Date() > new Date(usuario.reset_token_expira)) throw new Error('El link expiró');

    const hash = await bcrypt.hash(nuevaPassword, 10);
    await usuarioRepository.updatePassword(usuario.id, hash);
    await usuarioRepository.setResetToken(usuario.id, null, null);

    return { mensaje: 'Contraseña actualizada correctamente' };
}

// Cambiar contraseña desde el perfil (logueado)
exports.cambiarPassword = async (usuarioId, passwordActual, nuevaPassword) => {
    const usuario = await usuarioRepository.getById(usuarioId);
    if (!usuario) throw new Error('Usuario no encontrado');

    const valido = await bcrypt.compare(passwordActual, usuario.password);
    if (!valido) throw new Error('La contraseña actual es incorrecta');

    const hash = await bcrypt.hash(nuevaPassword, 10);
    await usuarioRepository.updatePassword(usuarioId, hash);

    return { mensaje: 'Contraseña actualizada correctamente' };
}

// función exclusiva para que el admin cree empleados
exports.crearEmpleado = async (data) => {
    // validar datos de autenticación con el validator de admin
    const erroresUsuario = validarCrearEmpleado(data);
    if (erroresUsuario.length > 0) throw new Error(erroresUsuario.join(', '));

    // validar datos personales del empleado
    const erroresEmpleado = validarEmpleado(data);
    if (erroresEmpleado.length > 0) throw new Error(erroresEmpleado.join(', '));

    // verificar que el email no esté registrado
    const usuarioExistente = await usuarioRepository.getByEmail(data.email);
    if (usuarioExistente) throw new Error('El email ya está registrado');

    // hashear la contraseña
    const hash = await bcrypt.hash(data.password, 10);

    // crear el usuario con rol empleado o admin
    const nuevoUsuario = await usuarioRepository.create({
        email: data.email,
        password: hash,
        rol: data.rol.toLowerCase()
    });

    // crear el empleado con el mismo id del usuario
    const nuevoEmpleado = await empleadoRepository.create(nuevoUsuario.id, {
        nombre: data.nombre,
        apellido: data.apellido,
        documento: data.documento,
        localidad: data.localidad,
        telefono: data.telefono,
        fecha_nacimiento: data.fecha_nacimiento
    });

    return { ...nuevoUsuario, ...nuevoEmpleado };
}

exports.login = async (data) => {
    const errores = validarLogin(data);
    if (errores.length > 0) throw new Error(errores.join(', '));

    const usuario = await usuarioRepository.getByEmail(data.email);
    if (!usuario) throw new Error('Email o contraseña incorrectos');

    const passwordValido = await bcrypt.compare(data.password, usuario.password);
    if (!passwordValido) throw new Error('Email o contraseña incorrectos');

    const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return { token, rol: usuario.rol, id: usuario.id };
}