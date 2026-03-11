import api from './axios'

export const getNotificaciones = () => api.get('/notificaciones').then(r => r.data)
export const marcarLeida = (id)   => api.put(`/notificaciones/${id}/leer`).then(r => r.data)
export const marcarTodasLeidas = () => api.put('/notificaciones/leer-todas').then(r => r.data)