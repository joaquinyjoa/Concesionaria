import { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [oscuro, setOscuro] = useState(() => {
        return localStorage.getItem('tema') === 'oscuro'
    })

    useEffect(() => {
        localStorage.setItem('tema', oscuro ? 'oscuro' : 'claro')
        document.documentElement.setAttribute('data-tema', oscuro ? 'oscuro' : 'claro')
    }, [oscuro])

    const toggleTema = () => setOscuro(o => !o)

    return (
        <ThemeContext.Provider value={{ oscuro, toggleTema }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTema() {
    return useContext(ThemeContext)
}