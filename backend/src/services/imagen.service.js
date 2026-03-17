const imagenRepository = require('../repositories/imagen.repository');
const vehiculoRepository = require('../repositories/vehiculo.repository');
const { cloudinary } = require('../config/cloudinary');

exports.create = async (vehiculo_id, file) => {
    const vehiculo = await vehiculoRepository.getById(vehiculo_id);
    if (!vehiculo) throw new Error('Vehículo no encontrado');

    const imagenesExistentes = await imagenRepository.getByVehiculoId(vehiculo_id);
    if (imagenesExistentes.length >= 3) {
        throw new Error('El vehículo no puede tener más de 3 imágenes');
    }

    // Cloudinary ya subió el archivo, file.path es la URL
    console.log('file.path:', file.path)
    console.log('file:', file)
    const url = file.path;
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

    // Borrar de Cloudinary usando el public_id
    try {
        const publicId = imagen.url.split('/').slice(-1)[0].split('.')[0]
        await cloudinary.uploader.destroy(`autocare/${publicId}`)
    } catch {}

    return await imagenRepository.delete(id);
}
