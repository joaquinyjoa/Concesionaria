import api from './axios'

export const getImagenesByVehiculo = (vehiculoId) =>
    api.get(`/vehiculos/${vehiculoId}/imagenes`).then(r => r.data)

export const subirImagen = (vehiculoId, formData) =>
    api.post(`/vehiculos/${vehiculoId}/imagenes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)

export const eliminarImagen = (id) => api.delete(`/imagenes/${id}`).then(r => r.data)