const { error } = require("console");
const vehiculoRepository = require("../repositories/vehiculo.repository");

exports.create = async (data) => {
    //validaciones
    const camposObligatorios = ["id",
        "tipo",
        "marca",
        "modelo",
        "motor",
        "anio",
        "kilometraje",
        "condicion",
        "estado",
        "precio"];

    const camposNumericos = ["id", "anio", "kilometraje", "precio"];

    const errores = [];

    // Validar obligatorios
    for(const campo of camposObligatorios){

        // Solo validamos si existe (para no duplicar error)
        if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
            errores.push(`Falta el campo ${campo}`);
        }
    }

    //Validar que sean números
    for (const campo of camposNumericos) {

        // Solo validamos si existe (para no duplicar error)
        if (data[campo] !== undefined && data[campo] !== null && data[campo] !== "") {

            const valor = Number(data[campo]);

            if (isNaN(valor)) {
                errores.push(`El campo ${campo} debe ser un número`);
            }
        }
    }

    if (errores.length > 0) {
        throw new Error(errores.join(", "));
    }

    return await vehiculoRepository.create(data);
}