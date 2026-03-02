function validarVehiculo(data) {

    const camposObligatorios = [
        "id",
        "tipo",
        "marca",
        "modelo",
        "motor",
        "anio",
        "kilometraje",
        "condicion",
        "estado",
        "precio"
    ];

    const camposNumericos = ["id", "anio", "kilometraje", "precio"];

    const camposString = [
        "tipo",
        "marca",
        "modelo",
        "motor",
        "condicion",
        "estado"
    ];

    const estadosValidos = ["nuevo", "usado"];
    const anioActual = new Date().getFullYear();

    const errores = [];

    // Obligatorios
    for (const campo of camposObligatorios) {
        if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
            errores.push(`Falta el campo ${campo}`);
        }
    }

    // estado válido
    if (data.estado && !estadosValidos.includes(data.estado.toLowerCase())) {
        errores.push("Estado debe ser nuevo o usado");
    }

    // anio válido
    if (data.anio) {
        const anio = Number(data.anio);
        if (anio < 1900 || anio > anioActual + 1) {
            errores.push("El año no es válido");
        }
    }

    //precio válido
    if (data.precio && !/^\d+(\.\d{1,2})?$/.test(data.precio)) {
        errores.push("El precio debe tener máximo 2 decimales");
    }

    // Numéricos
    for (const campo of camposNumericos) {
        if (data[campo] !== undefined && data[campo] !== null && data[campo] !== "") {
            const valor = Number(data[campo]);
            if (isNaN(valor)) {
                errores.push(`El campo ${campo} debe ser un número`);
            }
        }

    }

    // Strings no numéricos
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

module.exports = {
    validarVehiculo
};