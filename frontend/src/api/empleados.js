import api from './axios'

export const getEmpleadoById = (id) => api.get(`/empleados/${id}`)
export const actualizarEmpleado = (id, data) => api.put(`/empleados/${id}`, data)
export const eliminarEmpleado = (id) => api.delete(`/empleados/${id}`)