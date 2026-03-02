const vehiculoRepository = require("../repositories/vehiculo.repository");
const { validarVehiculo } = require("../utils/vehiculo.validator");

exports.create = async (data) => {

    const errores = validarVehiculo(data);

    if (errores.length > 0) {
        throw new Error(errores.join(", "));
    }

    return await vehiculoRepository.create(data);
};