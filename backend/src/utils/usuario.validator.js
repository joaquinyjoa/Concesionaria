function validarRegistro(data) {
    const errores = [];

    // Obligatorios
    const camposObligatorios = ['email', 'password', 'rol'];
    for (const campo of camposObligatorios) {
        if (!data[campo] || data[campo] === '') {
            errores.push(`Falta el campo ${campo}`);
        }
    }

    // email válido
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errores.push('El email no es válido');
    }

    // password válido
    if (data.password) {
        if (data.password.length < 8) {
            errores.push('La contraseña debe tener al menos 8 caracteres');
        }
        if (!/[A-Z]/.test(data.password)) {
            errores.push('La contraseña debe tener al menos una mayúscula');
        }
        if (!/[0-9]/.test(data.password)) {
            errores.push('La contraseña debe tener al menos un número');
        }
    }

    // rol válido
    const rolesValidos = ['cliente', 'empleado', 'admin'];
    if (data.rol && !rolesValidos.includes(data.rol.toLowerCase())) {
        errores.push('El rol debe ser: cliente, empleado o admin');
    }

    // el register público solo permite rol cliente
    if (data.rol && data.rol.toLowerCase() !== 'cliente') {
        errores.push('El registro público solo permite rol cliente');
    }

    return errores;
}

function validarLogin(data) {
    const errores = [];

    if (!data.email || data.email === '') errores.push('Falta el campo email');
    if (!data.password || data.password === '') errores.push('Falta el campo password');

    return errores;
}

// validador separado para cuando el admin crea un empleado
function validarCrearEmpleado(data) {
    const errores = [];

    const camposObligatorios = ['email', 'password', 'rol'];
    for (const campo of camposObligatorios) {
        if (!data[campo] || data[campo] === '') {
            errores.push(`Falta el campo ${campo}`);
        }
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errores.push('El email no es válido');
    }

    if (data.password) {
        if (data.password.length < 8) {
            errores.push('La contraseña debe tener al menos 8 caracteres');
        }
        if (!/[A-Z]/.test(data.password)) {
            errores.push('La contraseña debe tener al menos una mayúscula');
        }
        if (!/[0-9]/.test(data.password)) {
            errores.push('La contraseña debe tener al menos un número');
        }
    }

    // el admin solo puede crear empleados o admins, no clientes
    const rolesValidos = ['empleado', 'admin'];
    if (data.rol && !rolesValidos.includes(data.rol.toLowerCase())) {
        errores.push('Solo se pueden crear empleados o admins desde este endpoint');
    }

    return errores;
}

module.exports = { validarRegistro, validarLogin, validarCrearEmpleado };