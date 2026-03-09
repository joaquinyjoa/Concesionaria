import api from './axios'

export const getVehiculos = () => api.get('/vehiculos').then(r => r.data)
export const getVehiculoById = (id) => api.get(`/vehiculos/${id}`).then(r => r.data)
export const getVehiculosFiltrados = (filtros) => api.get('/vehiculos', { params: filtros }).then(r => r.data)
export const crearVehiculo = (data) => api.post('/vehiculos', data).then(r => r.data)
export const actualizarVehiculo = (id, data) => api.put(`/vehiculos/${id}`, data).then(r => r.data)
export const eliminarVehiculo = (id) => api.delete(`/vehiculos/${id}`).then(r => r.data)
export const reservarVehiculo = (id) => api.patch(`/vehiculos/${id}/reservar`).then(r => r.data)
export const cancelarReserva = (id) => api.patch(`/vehiculos/${id}/cancelar`).then(r => r.data)