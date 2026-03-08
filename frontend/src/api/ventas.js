import api from './axios'

export const crearVenta = (data) => api.post('/ventas', data)
export const getVentas = () => api.get('/ventas')
export const getVentaById = (id) => api.get(`/ventas/${id}`)