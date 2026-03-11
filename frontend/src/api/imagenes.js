import axios from 'axios'

export const subirImagen = async (vehiculoId, formData) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const res = await axios.post(
        `http://localhost:3000/concesionaria/vehiculos/${vehiculoId}/imagenes`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${usuario?.token}`
            }
        }
    )
    return res.data
}

export const getImagenesByVehiculo = (vehiculoId) =>
    import('./axios').then(m => m.default.get(`/vehiculos/${vehiculoId}/imagenes`).then(r => r.data))

export const eliminarImagen = (id) =>
    import('./axios').then(m => m.default.delete(`/imagenes/${id}`).then(r => r.data))