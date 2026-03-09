import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, CreditCard, MapPin, Phone, Calendar, Edit2, Save, X, LogOut, Car, Clock, CheckCircle, XCircle } from 'lucide-react'
import ToggleTema from '../components/ToggleTema'
import { useAuth } from '../context/AuthContext'
import { getClienteById, actualizarCliente } from '../api/clientes'

const ESTADO_CONFIG = {
  disponible: { label: 'Disponible', color: '#22c55e', icon: CheckCircle },
  reservado:  { label: 'Reservado',  color: '#f59e0b', icon: Clock },
  vendido:    { label: 'Vendido',    color: '#e63946', icon: XCircle },
}

console.log(JSON.parse(localStorage.getItem('usuario')))

export default function Perfil() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()

  const [cliente, setCliente] = useState(null)
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    const cargar = async () => {
      try {
        const clienteData = await getClienteById(usuario.id)
        const c = clienteData.cliente ?? clienteData.data ?? clienteData
        setCliente(c)
        setForm({
          nombre: c.nombre ?? '',
          apellido: c.apellido ?? '',
          telefono: c.telefono ?? '',
          localidad: c.localidad ?? '',
        })
      } catch {
        setError('No se pudieron cargar los datos.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [usuario])

  const handleGuardar = async () => {
    setGuardando(true)
    setError(null)
    try {
      await actualizarCliente(usuario.id, form)
      setCliente(c => ({ ...c, ...form }))
      setEditando(false)
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch {
      setError('No se pudo actualizar el perfil.')
    } finally {
      setGuardando(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid #e63946', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontSize: 14 }}>Cargando perfil...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .perfil-input { width: 100%; padding: 10px 14px; border-radius: 11px; border: 1.5px solid var(--input-border); background: var(--bg); color: var(--text); font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .perfil-input:focus { border-color: #e63946; box-shadow: 0 0 0 3px rgba(230,57,70,0.10); }
        .perfil-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .accion-btn { padding: 9px 18px; border-radius: 11px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s, transform 0.15s; font-family: 'DM Sans', sans-serif; }
        .accion-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .venta-card:hover { box-shadow: 0 6px 24px var(--shadow) !important; transform: translateY(-2px); }
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

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 5vw 60px' }}>

        {/* Header perfil */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar inicial */}
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #e63946, #f4845f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(230,57,70,0.3)',
              fontSize: 26, fontWeight: 800, color: '#fff',
              fontFamily: "'Sora', sans-serif",
            }}>
              {cliente?.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text)', margin: 0 }}>
                {cliente?.nombre} {cliente?.apellido}
              </h1>
              <span style={{ fontSize: 12, color: '#e63946', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                Cliente
              </span>
            </div>
          </div>

          <button className="accion-btn" onClick={handleLogout}
            style={{ background: 'rgba(230,57,70,0.08)', color: '#e63946', border: '1px solid rgba(230,57,70,0.2)' }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', color: '#e63946', fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}
        {exito && (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
            ✓ Perfil actualizado correctamente
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 24, alignItems: 'start' }}>

          {/* ── DATOS PERSONALES ── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: 0 }}>
                Datos personales
              </h2>
              {!editando ? (
                <button className="accion-btn" onClick={() => setEditando(true)}
                  style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1.5px solid var(--input-border)', padding: '7px 14px' }}>
                  <Edit2 size={13} /> Editar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="accion-btn" onClick={() => { setEditando(false); setError(null) }}
                    style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1.5px solid var(--input-border)', padding: '7px 12px' }}>
                    <X size={13} />
                  </button>
                  <button className="accion-btn" onClick={handleGuardar} disabled={guardando}
                    style={{ background: 'linear-gradient(90deg,#e63946,#f4845f)', color: '#fff', padding: '7px 14px' }}>
                    <Save size={13} /> {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Solo lectura */}
              <InfoRow icon={<Mail size={14} color="#e63946" />} label="Email" value={usuario?.email} />
              <InfoRow icon={<CreditCard size={14} color="#e63946" />} label="DNI" value={cliente?.documento} />
              <InfoRow icon={<Calendar size={14} color="#e63946" />} label="Fecha de nacimiento"
                value={cliente?.fecha_nacimiento ? new Date(cliente.fecha_nacimiento).toLocaleDateString('es-AR') : '—'} />

              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

              {/* Editables */}
              <EditableRow icon={<User size={14} color="#e63946" />} label="Nombre"
                value={editando ? form.nombre : cliente?.nombre}
                editando={editando} onChange={v => setForm(f => ({ ...f, nombre: v }))} />
              <EditableRow icon={<User size={14} color="#e63946" />} label="Apellido"
                value={editando ? form.apellido : cliente?.apellido}
                editando={editando} onChange={v => setForm(f => ({ ...f, apellido: v }))} />
              <EditableRow icon={<Phone size={14} color="#e63946" />} label="Teléfono"
                value={editando ? form.telefono : cliente?.telefono}
                editando={editando} onChange={v => setForm(f => ({ ...f, telefono: v }))} />
              <EditableRow icon={<MapPin size={14} color="#e63946" />} label="Localidad"
                value={editando ? form.localidad : cliente?.localidad}
                editando={editando} onChange={v => setForm(f => ({ ...f, localidad: v }))} />
            </div>
          </div>

          {/* ── HISTORIAL ── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px var(--shadow)' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: '0 0 22px' }}>
              Mis vehículos
              <span style={{ marginLeft: 8, fontSize: 13, color: '#e63946', fontWeight: 600 }}>({ventas.length})</span>
            </h2>

            {ventas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <Car size={40} color="#e63946" style={{ margin: '0 auto 12px', opacity: 0.25 }} />
                <p style={{ fontSize: 14, margin: 0 }}>Todavía no tenés vehículos</p>
                <button onClick={() => navigate('/')}
                  style={{ marginTop: 14, padding: '9px 20px', borderRadius: 11, background: 'linear-gradient(90deg,#e63946,#f4845f)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Ver catálogo
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ventas.map(venta => <VentaCard key={venta.id} venta={venta} onVerDetalle={() => navigate(`/vehiculos/${venta.vehiculo_id}`)} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-footer)', color: '#aaa', textAlign: 'center', padding: '28px 5vw', fontSize: 13 }}>
        <span style={{ color: '#e63946', fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>AUTO CARE</span>
        {' '}— Todos los derechos reservados © {new Date().getFullYear()}
      </footer>
    </div>
  )
}

// ─── Fila solo lectura ─────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(230,57,70,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, margin: 0 }}>{value || '—'}</p>
      </div>
    </div>
  )
}

// ─── Fila editable ────────────────────────────────────────
function EditableRow({ icon, label, value, editando, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(230,57,70,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 4px' }}>{label}</p>
        {editando ? (
          <input className="perfil-input" value={value} onChange={e => onChange(e.target.value)} />
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, margin: 0 }}>{value || '—'}</p>
        )}
      </div>
    </div>
  )
}

// ─── Card de venta ────────────────────────────────────────
function VentaCard({ venta, onVerDetalle }) {
  const estado = ESTADO_CONFIG[venta.vehiculo?.estado] ?? ESTADO_CONFIG.vendido
  const EstadoIcon = estado.icon
  return (
    <div className="venta-card" style={{
      background: 'var(--bg)', borderRadius: 14, padding: '14px 16px',
      border: '1px solid var(--border)', transition: 'all 0.2s', cursor: 'pointer',
    }} onClick={onVerDetalle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(230,57,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Car size={18} color="#e63946" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: "'Sora', sans-serif" }}>
              {venta.vehiculo?.marca} {venta.vehiculo?.modelo}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              {venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString('es-AR') : '—'} · {venta.metodo_pago}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#e63946', margin: 0, fontFamily: "'Sora', sans-serif" }}>
            ${venta.precio_venta?.toLocaleString()}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: estado.color, marginTop: 3 }}>
            <EstadoIcon size={11} /> {estado.label}
          </div>
        </div>
      </div>
    </div>
  )
}