const usuarioRepository = require('../repositories/usuario.repository');
const clienteRepository = require('../repositories/cliente.repository');
const { validarRegistro } = require('../utils/usuario.validator');
const { validarCliente } = require('../utils/cliente.validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (data) => {
    // validar usuario
    const erroresUsuario = validarRegistro(data);
    if (erroresUsuario.length > 0) throw new Error(erroresUsuario.join(', '));

    // validar datos personales
    const erroresCliente = validarCliente(data);
    if (erroresCliente.length > 0) throw new Error(erroresCliente.join(', '));

    // verificar si el email ya existe
    const usuarioExistente = await usuarioRepository.getByEmail(data.email);
    if (usuarioExistente) throw new Error('El email ya está registrado');

    // hashear la contraseña
    const hash = await bcrypt.hash(data.password, 10);

    // crear usuario
    const nuevoUsuario = await usuarioRepository.create({
        email: data.email,
        password: hash,
        rol: data.rol.toLowerCase()
    });

    // crear cliente con el mismo id
    const nuevoCliente = await clienteRepository.create(nuevoUsuario.id, {
        nombre: data.nombre,
        apellido: data.apellido,
        documento: data.documento,
        localidad: data.localidad,
        telefono: data.telefono,
        fecha_nacimiento: data.fecha_nacimiento
    });

    return { ...nuevoUsuario, ...nuevoCliente };
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