import api from './axios'

export const login = (data) => api.post('/auth/login', data).then(r => r.data)
export const register = (data) => api.post('/auth/register', data).then(r => r.data)
export const solicitarReset = (email) => api.post('/auth/solicitar-reset', { email }).then(r => r.data)
export const resetPassword = (token, nuevaPassword) => api.post('/auth/reset-password', { token, nuevaPassword }).then(r => r.data)
export const verificarCuenta = (token) => api.get(`/auth/verificar?token=${token}`).then(r => r.data)
export const cambiarPassword = (passwordActual, nuevaPassword) => api.put('/auth/cambiar-password', { passwordActual, nuevaPassword }).then(r => r.data)