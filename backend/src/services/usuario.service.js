const usuarioRepository = require('../repositories/usuario.repository');
const { validarRegistro, validarLogin } = require('../utils/usuario.validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (data) => {
    const errores = validarRegistro(data);
    if (errores.length > 0) throw new Error(errores.join(', '));

    // verificar si el email ya existe
    const usuarioExistente = await usuarioRepository.getByEmail(data.email);
    if (usuarioExistente) throw new Error('El email ya está registrado');

    // hashear la contraseña
    const hash = await bcrypt.hash(data.password, 10);

    const nuevoUsuario = await usuarioRepository.create({
        email: data.email,
        password: hash,
        rol: data.rol.toLowerCase()
    });

    return nuevoUsuario;
}

exports.login = async (data) => {
    const errores = validarLogin(data);
    if (errores.length > 0) throw new Error(errores.join(', '));

    // verificar si el usuario existe
    const usuario = await usuarioRepository.getByEmail(data.email);
    if (!usuario) throw new Error('Email o contraseña incorrectos');

    // comparar contraseña
    const passwordValido = await bcrypt.compare(data.password, usuario.password);
    if (!passwordValido) throw new Error('Email o contraseña incorrectos');

    // generar JWT
    const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return { token, rol: usuario.rol, id: usuario.id };
}
```

Y agregá la variable en el `.env`:
```
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura