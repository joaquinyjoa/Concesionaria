import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {

    // carga sincrónica — evita el parpadeo y el redirect al refrescar
    const [usuario, setUsuario] = useState(() => {
        try {
            const guardado = localStorage.getItem('usuario')
            return guardado ? JSON.parse(guardado) : null
        } catch {
            localStorage.removeItem('usuario')
            return null
        }
    })

    const login = (token, datos) => {
        const user = { ...datos, token }
        setUsuario(user)
        localStorage.setItem('usuario', JSON.stringify(user))
    }

    const logout = () => {
        setUsuario(null)
        localStorage.removeItem('usuario')
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}