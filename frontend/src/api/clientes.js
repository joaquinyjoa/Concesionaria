import api from './axios'

export const getClienteById = (id) => api.get(`/clientes/${id}`)
export const actualizarCliente = (id, data) => api.put(`/clientes/${id}`, data)
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`)