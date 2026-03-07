const usuarioRepository = require('../repositories/usuario.repository');
const clienteRepository = require('../repositories/cliente.repository');
const empleadoRepository = require('../repositories/empleado.repository');
const { validarRegistro, validarLogin } = require('../utils/usuario.validator');
const { validarCliente } = require('../utils/cliente.validator');
const { validarEmpleado } = require('../utils/empleado.validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

    return nuevoUsuario;
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