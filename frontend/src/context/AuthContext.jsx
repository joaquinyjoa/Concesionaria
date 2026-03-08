import { createContext, useState, useContext } from 'react'

// creamos el contexto
const AuthContext = createContext()

// proveedor que envuelve la app y comparte el estado
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    // usuario tiene esta forma cuando está logueado:
    // { id, rol, token }

    const login = (datos) => {
        setUsuario(datos)
        // guardamos en localStorage para que no se pierda al recargar
        localStorage.setItem('usuario', JSON.stringify(datos))
    }

    const logout = () => {
        setUsuario(null)
        localStorage.removeItem('usuario')
    }

    // al cargar la app revisamos si hay un usuario guardado
    useState(() => {
        const guardado = localStorage.getItem('usuario')
        if (guardado) setUsuario(JSON.parse(guardado))
    }, [])

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// hook para usar el contexto fácilmente
export function useAuth() {
    return useContext(AuthContext)
}