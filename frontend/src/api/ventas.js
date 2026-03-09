import api from './axios'

export const crearVenta = (data) => api.post('/ventas', data).then(r => r.data)
export const getVentas = () => api.get('/ventas').then(r => r.data)
export const getVentaById = (id) => api.get(`/ventas/${id}`).then(r => r.data)