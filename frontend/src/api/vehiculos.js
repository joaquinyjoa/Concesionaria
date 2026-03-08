import api from './axios'

export const getVehiculos = () => api.get('/vehiculos')
export const getVehiculoById = (id) => api.get(`/vehiculos/${id}`)
export const getVehiculosFiltrados = (filtros) => api.get('/vehiculos', { params: filtros })
export const crearVehiculo = (data) => api.post('/vehiculos', data)
export const actualizarVehiculo = (id, data) => api.put(`/vehiculos/${id}`, data)
export const eliminarVehiculo = (id) => api.delete(`/vehiculos/${id}`)
export const reservarVehiculo = (id) => api.patch(`/vehiculos/${id}/reservar`)
export const cancelarReserva = (id) => api.patch(`/vehiculos/${id}/cancelar`)