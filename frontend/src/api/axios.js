import axios from 'axios'

const api = axios.create({
    baseURL: '/concesionaria'
})

// interceptor que agrega el token en cada request automáticamente
api.interceptors.request.use((config) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (usuario?.token) {
        config.headers.Authorization = `Bearer ${usuario.token}`
    }
    return config
})

export default api