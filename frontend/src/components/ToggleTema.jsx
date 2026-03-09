import { useTema } from '../context/ThemeContext'
import { Moon } from 'lucide-react'

export default function ToggleTema() {
    const { oscuro, toggleTema } = useTema()

    return (
        <button
            onClick={toggleTema}
            style={{
                background: oscuro ? 'rgba(230,57,70,0.15)' : 'rgba(230,57,70,0.08)',
                border: '1.5px solid rgba(230,57,70,0.20)',
                borderRadius: 12,
                width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            }}
        >
            <Moon
                size={18}
                color="#e63946"
                style={{
                    transform: oscuro ? 'rotate(360deg)' : 'rotate(0deg)',
                    transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
                    fill: oscuro ? '#e63946' : 'none',
                }}
            />
        </button>
    )
}