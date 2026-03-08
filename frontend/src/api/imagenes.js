import api from './axios'

export const getImagenesByVehiculo = (vehiculoId) => 
    api.get(`/vehiculos/${vehiculoId}/imagenes`)

export const subirImagen = (vehiculoId, formData) => 
    api.post(`/vehiculos/${vehiculoId}/imagenes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

export const eliminarImagen = (id) => api.delete(`/imagenes/${id}`)