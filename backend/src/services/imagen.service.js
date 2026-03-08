const imagenRepository = require('../repositories/imagen.repository');
const vehiculoRepository = require('../repositories/vehiculo.repository');
const fs = require('fs');
const path = require('path');

exports.create = async (vehiculo_id, file) => {
    // verificar que el vehículo existe
    const vehiculo = await vehiculoRepository.getById(vehiculo_id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');

    // verificar que no tenga más de 3 imágenes
    const imagenesExistentes = await imagenRepository.getByVehiculoId(vehiculo_id);
    if (imagenesExistentes.length >= 3) {
        throw new Error('El vehículo no puede tener más de 3 imágenes');
    }

    const url = `/uploads/${file.filename}`;
    return await imagenRepository.create(vehiculo_id, url);
}

exports.getByVehiculoId = async (vehiculo_id) => {
    const vehiculo = await vehiculoRepository.getById(vehiculo_id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');
    return await imagenRepository.getByVehiculoId(vehiculo_id);
}

exports.delete = async (id) => {
    const imagen = await imagenRepository.getById(id);
    if (!imagen) throw new Error('Imagen no encontrada');

    // borrar el archivo físico del servidor
    const filePath = path.join(__dirname, '../../', imagen.url);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    return await imagenRepository.delete(id);
}