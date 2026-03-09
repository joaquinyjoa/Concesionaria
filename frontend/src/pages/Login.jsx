import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Car, Eye, EyeOff } from 'lucide-react'
import ToggleTema from '../components/ToggleTema'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setError(null)
    setCargando(true)
    try {
      const data = await loginApi(form)
      login(data.token, data.usuario ?? data)
      // redirigir según rol
      const rol = data.usuario?.rol ?? data.rol
      if (rol === 'admin' || rol === 'empleado') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (e) {
      setError(e.response?.data?.error ?? 'Email o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .login-input { width: 100%; padding: 12px 14px 12px 42px; border-radius: 12px; border: 1.5px solid var(--input-border); background: var(--bg); color: var(--text); font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .login-input:focus { border-color: #e63946; box-shadow: 0 0 0 3px rgba(230,57,70,0.10); }
        .login-input::placeholder { color: var(--text-muted); opacity: 0.6; }
        .login-btn { width: 100%; padding: 13px; border-radius: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; font-family: 'Sora', sans-serif; transition: opacity 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .login-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg) } }
        .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-nav)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 5vw', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Auto Care" style={{ height: 36, width: 36, objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none' }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: '#e63946' }}>
            AUTO <span style={{ color: 'var(--text)' }}>CARE</span>
          </span>
        </div>
        <ToggleTema />
      </nav>

      {/* CONTENIDO */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 5vw 60px', minHeight: 'calc(100vh - 64px)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #e63946, #f4845f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(230,57,70,0.3)',
            }}>
              <Car size={28} color="#fff" />
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 28, color: 'var(--text)', margin: '0 0 8px' }}>
              Bienvenido de nuevo
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Ingresá a tu cuenta para continuar
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 24, padding: '32px 32px 28px',
            boxShadow: '0 8px 40px var(--shadow)', border: '1px solid var(--border)',
          }}>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 20, padding: '12px 16px', borderRadius: 12,
                background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
                color: '#e63946', fontSize: 13, fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#e63946" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    className="login-input"
                    type="email"
                    placeholder="juan@email.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#e63946" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    className="login-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="current-password"
                  />
                  <button
                    onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Botón */}
            <button
              className="login-btn"
              onClick={handleSubmit}
              disabled={cargando}
              style={{
                marginTop: 28,
                background: 'linear-gradient(90deg, #e63946 0%, #f4845f 100%)',
                color: '#fff',
              }}
            >
              {cargando ? <><span className="spinner" /> Ingresando...</> : 'Ingresar'}
            </button>

            {/* Divisor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>o</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Botón ir al catálogo */}
            <button
              className="login-btn"
              onClick={() => navigate('/')}
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1.5px solid var(--input-border)',
                fontSize: 14,
              }}
            >
              Ver catálogo sin cuenta
            </button>
          </div>

          {/* Footer link */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            ¿No tenés cuenta?{' '}
            <span onClick={() => navigate('/register')} style={{ color: '#e63946', fontWeight: 700, cursor: 'pointer' }}>
              Registrate gratis
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', letterSpacing: 1,
  textTransform: 'uppercase', marginBottom: 6,
}