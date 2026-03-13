import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, CreditCard, MapPin, Phone, Calendar, Car, Eye, EyeOff, ChevronRight } from 'lucide-react'
import ToggleTema from '../components/ToggleTema'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const CAMPOS = [
  { key: 'nombre',          label: 'Nombre',          icon: User,       type: 'text',     placeholder: 'Juan' },
  { key: 'apellido',        label: 'Apellido',         icon: User,       type: 'text',     placeholder: 'Pérez' },
  { key: 'email',           label: 'Email',            icon: Mail,       type: 'email',    placeholder: 'juan@email.com' },
  { key: 'password',        label: 'Contraseña',       icon: Lock,       type: 'password', placeholder: 'Mínimo 6 caracteres' },
  { key: 'documento',       label: 'DNI',              icon: CreditCard, type: 'text',     placeholder: '12345678' },
  { key: 'telefono',        label: 'Teléfono',         icon: Phone,      type: 'text',     placeholder: '+54 11 1234-5678' },
  { key: 'localidad',       label: 'Localidad',        icon: MapPin,     type: 'text',     placeholder: 'Buenos Aires' },
  { key: 'fecha_nacimiento',label: 'Fecha nacimiento', icon: Calendar,   type: 'date',     placeholder: '' },
]

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '',
    documento: '', telefono: '', localidad: '', fecha_nacimiento: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [paso, setPaso] = useState(1) // 1 = cuenta, 2 = datos personales

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setError(null)
    setCargando(true)
    try {
      const data = await register({ ...form, rol: 'cliente' })
      login(data.token, data.usuario ?? data)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.error ?? 'Error al registrarse. Verificá los datos.')
    } finally {
      setCargando(false)
    }
  }

  const camposPaso1 = CAMPOS.slice(0, 4)
  const camposPaso2 = CAMPOS.slice(4)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .reg-input { width: 100%; padding: 11px 14px 11px 40px; border-radius: 12px; border: 1.5px solid var(--input-border); background: var(--bg); color: var(--text); font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .reg-input:focus { border-color: #e63946; box-shadow: 0 0 0 3px rgba(230,57,70,0.10); }
        .reg-input::placeholder { color: var(--text-muted); opacity: 0.6; }
        .paso-btn { flex: 1; padding: 13px; border-radius: 14px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; font-family: 'Sora', sans-serif; transition: opacity 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .paso-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .paso-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .step-dot { width: 10px; height: 10px; border-radius: 50%; transition: all 0.3s ease; }
        @keyframes spin { to { transform: rotate(360deg) } }
        .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        .spinner-red { width: 18px; height: 18px; border: 2.5px solid rgba(230,57,70,0.2); border-top-color: #e63946; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @media (max-width: 480px) {
          .reg-card { padding: 24px 20px 20px !important; border-radius: 18px !important; }
          .reg-title { font-size: 22px !important; }
          .reg-top { padding: 32px 5vw 44px !important; }
        }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 5vw 60px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

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
              Crear cuenta
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Registrate para reservar tu próximo vehículo
            </p>
          </div>

          {/* Steps indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            <StepLabel num={1} label="Tu cuenta" activo={paso === 1} completado={paso > 1} />
            <div style={{ flex: 1, maxWidth: 60, height: 2, background: paso > 1 ? '#e63946' : 'var(--border)', borderRadius: 2, transition: 'background 0.3s' }} />
            <StepLabel num={2} label="Tus datos" activo={paso === 2} completado={false} />
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

            {/* PASO 1 */}
            {paso === 1 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>
                  Datos de acceso
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {camposPaso1.map(c => (
                    <Campo
                      key={c.key} campo={c} value={form[c.key]}
                      onChange={val => set(c.key, val)}
                      showPass={showPass} togglePass={() => setShowPass(s => !s)}
                    />
                  ))}
                </div>
                <button
                  className="paso-btn"
                  onClick={() => { setError(null); setPaso(2) }}
                  disabled={!form.nombre || !form.apellido || !form.email || !form.password}
                  style={{ marginTop: 24, width: '100%', background: 'linear-gradient(90deg, #e63946, #f4845f)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* PASO 2 */}
            {paso === 2 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>
                  Datos personales
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {camposPaso2.map(c => (
                    <Campo key={c.key} campo={c} value={form[c.key]} onChange={val => set(c.key, val)} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button
                    className="paso-btn"
                    onClick={() => setPaso(1)}
                    style={{ background: 'var(--bg)', color: 'var(--text)', border: '1.5px solid var(--input-border)', flex: '0 0 auto', width: 48, padding: 0 }}
                  >
                    ←
                  </button>
                  <button
                    className="paso-btn"
                    onClick={handleSubmit}
                    disabled={cargando}
                    style={{ background: 'linear-gradient(90deg, #e63946, #f4845f)', color: '#fff' }}
                  >
                    {cargando ? <><span className="spinner" /> Creando cuenta...</> : 'Crear cuenta'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer link */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            ¿Ya tenés cuenta?{' '}
            <span onClick={() => navigate('/login')} style={{ color: '#e63946', fontWeight: 700, cursor: 'pointer' }}>
              Iniciá sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Campo input con ícono ─────────────────────────────────
function Campo({ campo, value, onChange, showPass, togglePass }) {
  const Icon = campo.icon
  const isPass = campo.key === 'password'
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
        {campo.label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} color="#e63946" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="reg-input"
          type={isPass ? (showPass ? 'text' : 'password') : campo.type}
          placeholder={campo.placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {isPass && (
          <button onClick={togglePass} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Step label ────────────────────────────────────────────
function StepLabel({ num, label, activo, completado }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: activo || completado ? 'linear-gradient(135deg,#e63946,#f4845f)' : 'var(--bg-card)',
        border: activo || completado ? 'none' : '2px solid var(--input-border)',
        color: activo || completado ? '#fff' : 'var(--text-muted)',
        fontSize: 12, fontWeight: 800, transition: 'all 0.3s',
      }}>
        {completado ? '✓' : num}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: activo ? '#e63946' : 'var(--text-muted)', transition: 'color 0.3s' }}>
        {label}
      </span>
    </div>
  )
}