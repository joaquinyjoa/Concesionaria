function validarVehiculo(data) {

    const camposObligatorios = [
        "tipo", "marca", "modelo", "motor",
        "anio", "kilometraje", "condicion", "estado", "precio"
    ];

    const camposNumericos = ["anio", "kilometraje", "precio"];

    const camposString = ["tipo", "marca", "modelo", "motor"];

    const estadosValidos = ["disponible", "reservado", "vendido"];
    const condicionesValidas = ["nuevo", "usado"];
    const tiposValidos = ["auto", "moto", "camioneta", "camion"];

    const anioActual = new Date().getFullYear();
    const errores = [];

    // Obligatorios
    for (const campo of camposObligatorios) {
        if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
            errores.push(`Falta el campo ${campo}`);
        }
    }

    // tipo válido
    if (data.tipo && !tiposValidos.includes(data.tipo.toLowerCase())) {
        errores.push("Tipo debe ser: auto, moto, camioneta o camion");
    }

    // estado válido
    if (data.estado && !estadosValidos.includes(data.estado.toLowerCase())) {
        errores.push("Estado debe ser: disponible, reservado o vendido");
    }

    // condicion válida
    if (data.condicion && !condicionesValidas.includes(data.condicion.toLowerCase())) {
        errores.push("Condición debe ser: nuevo o usado");
    }

    // anio válido
    if (data.anio) {
        const anio = Number(data.anio);
        if (isNaN(anio) || anio < 1900 || anio > anioActual + 1) {
            errores.push("El año no es válido");
        }
    }

    // kilometraje válido
    if (data.kilometraje !== undefined && data.kilometraje !== null && data.kilometraje !== "") {
        const km = Number(data.kilometraje);
        if (isNaN(km) || km < 0) {
            errores.push("El kilometraje no puede ser negativo");
        }
    }

    // precio válido
    if (data.precio !== undefined && data.precio !== null && data.precio !== "") {
        const precio = Number(data.precio);
        if (isNaN(precio) || precio <= 0) {
            errores.push("El precio debe ser mayor a 0");
        }
        if (!/^\d+(\.\d{1,2})?$/.test(String(data.precio))) {
            errores.push("El precio debe tener máximo 2 decimales");
        }
    }

    // Numéricos
    for (const campo of camposNumericos) {
        if (data[campo] !== undefined && data[campo] !== null && data[campo] !== "") {
            if (isNaN(Number(data[campo]))) {
                errores.push(`El campo ${campo} debe ser un número`);
            }
        }
    }

    // Strings
    for (const campo of camposString) {
        const valor = data[campo]?.trim();
        if (valor) {
            if (!isNaN(valor)) {
                errores.push(`El campo ${campo} no puede ser numérico`);
            }
            if (valor.length < 2) {
                errores.push(`El campo ${campo} es demasiado corto`);
            }
        }
    }

    return errores;
}

module.exports = { validarVehiculo };