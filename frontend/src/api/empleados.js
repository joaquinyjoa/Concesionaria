import api from './axios'

export const getEmpleadoById = (id) => api.get(`/empleados/${id}`).then(r => r.data)
export const actualizarEmpleado = (id, data) => api.put(`/empleados/${id}`, data).then(r => r.data)
export const eliminarEmpleado = (id) => api.delete(`/empleados/${id}`).then(r => r.data)