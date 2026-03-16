import api from './axios'

export const getClienteById = (id) => api.get(`/clientes/${id}`).then(r => r.data)
export const actualizarCliente = (id, data) => api.put(`/clientes/${id}`, data).then(r => r.data)
export const getClienteMe = () => api.get('/clientes/me').then(r => r.data)
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`).then(r => r.data)