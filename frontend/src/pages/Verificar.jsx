import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Car, Loader } from 'lucide-react'
import ToggleTema from '../components/ToggleTema'
import { verificarCuenta } from '../api/auth'

export default function Verificar() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [estado, setEstado] = useState('cargando') // cargando | ok | error
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!token) { setEstado('error'); setMensaje('Token inválido.'); return }
    const verificar = async () => {
      try {
        const data = await verificarCuenta(token)
        setMensaje(data.mensaje)
        setEstado('ok')
      } catch (e) {
        setMensaje(e.response?.data?.error ?? 'El link expiró o es inválido.')
        setEstado('error')
      }
    }
    verificar()
  }, [token])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap'); @keyframes spin { to { transform: rotate(360deg) } } @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } } .fade-up { animation: fadeUp 0.5s ease forwards; }`}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-nav)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 5vw', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Auto Care" style={{ height: 36, width: 36, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none' }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: '#e63946' }}>AUTO <span style={{ color: 'var(--text)' }}>CARE</span></span>
        </div>
        <ToggleTema />
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 5vw' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

          {estado === 'cargando' && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(230,57,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#e63946', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text)', margin: '0 0 8px' }}>Verificando tu cuenta...</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Un momento por favor</p>
            </>
          )}

          {estado === 'ok' && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: '0 0 8px' }}>¡Cuenta verificada!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>{mensaje}</p>
              <button onClick={() => navigate('/login')} style={{ padding: '13px 32px', borderRadius: 14, background: 'linear-gradient(90deg,#e63946,#f4845f)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                Iniciar sesión
              </button>
            </>
          )}

          {estado === 'error' && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(230,57,70,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <XCircle size={36} color="#e63946" />
              </div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: '0 0 8px' }}>Link inválido</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>{mensaje}</p>
              <button onClick={() => navigate('/login')} style={{ padding: '13px 32px', borderRadius: 14, background: 'linear-gradient(90deg,#e63946,#f4845f)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                Volver al login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}