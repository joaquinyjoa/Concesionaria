import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, Car } from 'lucide-react'
import ToggleTema from '../components/ToggleTema'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [form, setForm] = useState({ nueva: '', confirmar: '' })
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (form.nueva.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (form.nueva !== form.confirmar) return setError('Las contraseñas no coinciden.')
    setCargando(true)
    try {
      await resetPassword(token, form.nueva)
      setExito(true)
    } catch (e) {
      setError(e.response?.data?.error ?? 'El link expiró o es inválido.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .rp-input { width: 100%; padding: 12px 14px 12px 42px; border-radius: 12px; border: 1.5px solid var(--input-border); background: var(--bg); color: var(--text); font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .rp-input:focus { border-color: #e63946; box-shadow: 0 0 0 3px rgba(230,57,70,0.10); }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-nav)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 5vw', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Auto Care" style={{ height: 36, width: 36, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none' }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: '#e63946' }}>AUTO <span style={{ color: 'var(--text)' }}>CARE</span></span>
        </div>
        <ToggleTema />
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 5vw' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>

          {exito ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: '0 0 8px' }}>¡Contraseña actualizada!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>Ya podés iniciar sesión con tu nueva contraseña.</p>
              <button onClick={() => navigate('/login')} style={{ padding: '13px 32px', borderRadius: 14, background: 'linear-gradient(90deg,#e63946,#f4845f)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                Iniciar sesión
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px', background: 'linear-gradient(135deg,#e63946,#f4845f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(230,57,70,0.3)' }}>
                  <Lock size={26} color="#fff" />
                </div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: '0 0 8px' }}>Nueva contraseña</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Ingresá tu nueva contraseña</p>
              </div>

              <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: '32px', boxShadow: '0 8px 40px var(--shadow)', border: '1px solid var(--border)' }}>
                {error && (
                  <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946', fontSize: 13, fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Nueva contraseña</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="#e63946" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="rp-input" type={showNueva ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.nueva} onChange={e => setForm(f => ({ ...f, nueva: e.target.value }))} />
                      <button onClick={() => setShowNueva(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {showNueva ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmar contraseña</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="#e63946" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input className="rp-input" type={showConfirmar ? 'text' : 'password'} placeholder="Repetí la contraseña" value={form.confirmar} onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))} />
                      <button onClick={() => setShowConfirmar(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                        {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={cargando} style={{ marginTop: 28, width: '100%', padding: '13px', borderRadius: 14, background: 'linear-gradient(90deg,#e63946,#f4845f)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: "'Sora',sans-serif", opacity: cargando ? 0.7 : 1 }}>
                  {cargando ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }