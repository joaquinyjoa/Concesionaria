import api from './axios'

export const subirImagen = async (vehiculoId, formData) => {
    const res = await api.post(
        `/vehiculos/${vehiculoId}/imagenes`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res.data
}

export const getImagenesByVehiculo = (vehiculoId) =>
    api.get(`/vehiculos/${vehiculoId}/imagenes`).then(r => r.data)

export const eliminarImagen = (id) =>
    api.delete(`/imagenes/${id}`).then(r => r.data)