const vehiculoRepository = require("../repositories/vehiculo.repository");
const { validarVehiculo } = require("../utils/vehiculo.validator");

exports.getAll = async () => {
    return await vehiculoRepository.getAll();
}

exports.getById = async (id) => {
    const vehiculo = await vehiculoRepository.getById(id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    return vehiculo;
}

exports.create = async (data) => {

    const errores = validarVehiculo(data);

    if (errores.length > 0) {
        throw new Error(errores.join(", "));
    }

    return await vehiculoRepository.create(data);
};

exports.update = async (id, data) => {
    const errores = validarVehiculo(data);
    if (errores.length > 0) {
        throw new Error(errores.join(", "));
    }

    const vehiculo = await vehiculoRepository.getById(id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    
    return await vehiculoRepository.update(id, data);
}