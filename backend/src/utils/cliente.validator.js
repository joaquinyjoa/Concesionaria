function validarCliente(data) {
    const errores = [];

    const camposObligatorios = ['nombre', 'apellido', 'documento', 'localidad', 'telefono', 'fecha_nacimiento'];
    for (const campo of camposObligatorios) {
        if (!data[campo] || data[campo] === '') {
            errores.push(`Falta el campo ${campo}`);
        }
    }

    // nombre y apellido solo letras
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (data.nombre && !soloLetras.test(data.nombre)) {
        errores.push('El nombre solo puede contener letras');
    }
    if (data.apellido && !soloLetras.test(data.apellido)) {
        errores.push('El apellido solo puede contener letras');
    }

    // documento solo números
    if (data.documento && !/^\d{7,8}$/.test(data.documento)) {
        errores.push('El documento debe tener entre 7 y 8 dígitos');
    }

    // telefono solo números
    if (data.telefono && !/^\d{10}$/.test(data.telefono)) {
        errores.push('El teléfono debe tener 10 dígitos');
    }

    // fecha de nacimiento válida
    if (data.fecha_nacimiento) {
        const fecha = new Date(data.fecha_nacimiento);
        const hoy = new Date();
        if (isNaN(fecha.getTime())) {
            errores.push('La fecha de nacimiento no es válida');
        } else if (fecha >= hoy) {
            errores.push('La fecha de nacimiento debe ser anterior a hoy');
        }
    }

    return errores;
}

module.exports = { validarCliente };