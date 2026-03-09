import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Gauge, Calendar,
  Car, Wrench, Tag, CircleDot, CheckCircle, Clock, XCircle,
  Phone, Mail, MapPin
} from 'lucide-react'
import ToggleTema from '../components/ToggleTema'
import { useAuth } from '../context/AuthContext'
import { getVehiculoById, reservarVehiculo } from '../api/vehiculos'
import { getImagenesByVehiculo } from '../api/imagenes'

const ESTADO_CONFIG = {
  disponible: { label: 'Disponible', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle },
  reservado:  { label: 'Reservado',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  vendido:    { label: 'Vendido',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle },
}

export default function DetalleVehiculo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [vehiculo, setVehiculo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [reservando, setReservando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    const cargar = async () => {
        try {
        const data = await getVehiculoById(id)
        // normalizamos la respuesta igual que en Home
        const vehiculoData = data.vehiculo ?? data.data ?? data
        const imagenes = await getImagenesByVehiculo(id)
        const imagenesData = Array.isArray(imagenes) ? imagenes : imagenes.imagenes ?? imagenes.data ?? []
        setVehiculo({ ...vehiculoData, imagenes: imagenesData })
        } catch {
        setError('No se pudo cargar el vehículo.')
        } finally {
        setCargando(false)
        }
    }
    cargar()
    }, [id])

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid #e63946', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontSize: 14 }}>Cargando vehículo...</p>
      </div>
    </div>
  )

  if (error || !vehiculo) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <Car size={48} color="#e63946" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
        <p>Vehículo no encontrado</p>
        <button onClick={() => navigate('/')} style={btnSecondaryStyle}>← Volver al inicio</button>
      </div>
    </div>
  )

  const imgs = vehiculo.imagenes || []
  const prev = () => setImgIdx(p => (p - 1 + imgs.length) % imgs.length)
  const next = () => setImgIdx(p => (p + 1) % imgs.length)
  const estado = ESTADO_CONFIG[vehiculo.estado] || ESTADO_CONFIG.disponible
  const EstadoIcon = estado.icon
  const puedeReservar = usuario?.rol === 'cliente' && vehiculo.estado === 'disponible'

  const handleReservar = async () => {
    setReservando(true)
    try {
      await reservarVehiculo(vehiculo.id)
      setVehiculo(v => ({ ...v, estado: 'reservado' }))
      setMensaje({ tipo: 'ok', texto: '¡Vehículo reservado exitosamente! Un asesor se pondrá en contacto pronto.' })
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo reservar el vehículo. Intentá de nuevo.' })
    } finally {
      setReservando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .thumb-btn { border: 2px solid transparent; border-radius: 10px; overflow: hidden; cursor: pointer; transition: border-color 0.2s, opacity 0.2s; opacity: 0.6; }
        .thumb-btn:hover { opacity: 1; }
        .thumb-btn.active { border-color: #e63946; opacity: 1; }
        .spec-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; transition: box-shadow 0.2s; }
        .spec-card:hover { box-shadow: 0 4px 16px var(--shadow); }
        .reservar-btn { width: 100%; padding: 14px; border-radius: 14px; font-size: 16px; font-weight: 800; border: none; cursor: pointer; font-family: 'Sora', sans-serif; letter-spacing: 0.5px; transition: opacity 0.2s, transform 0.15s; }
        .reservar-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .reservar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-nav)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 5vw', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', fontWeight: 600, fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <ArrowLeft size={18} color="#e63946" /> Volver al catálogo
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Auto Care" style={{ height: 36, width: 36, objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none' }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: '#e63946' }}>
            AUTO <span style={{ color: 'var(--text)' }}>CARE</span>
          </span>
        </div>
        <ToggleTema />
      </nav>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5vw 60px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 13, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', color: '#e63946' }} onClick={() => navigate('/')}>Inicio</span>
          <ChevronRight size={14} />
          <span>{vehiculo.marca} {vehiculo.modelo}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: 40, alignItems: 'start' }}>

          {/* ── COLUMNA IZQUIERDA: imágenes ── */}
          <div>
            {/* Imagen principal */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'var(--bg-card)', aspectRatio: '16/10' }}>
              <img
                src={imgs[imgIdx]?.url}
                alt={vehiculo.modelo}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.4s' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/800x500?text=Sin+imagen' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />

              {/* Flechas */}
              {imgs.length > 1 && (
                <>
                  <button onClick={prev} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
                    width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}><ChevronLeft size={20} color="#e63946" /></button>
                  <button onClick={next} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
                    width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}><ChevronRight size={20} color="#e63946" /></button>
                </>
              )}

              {/* Dots */}
              {imgs.length > 1 && (
                <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7 }}>
                  {imgs.map((_, i) => (
                    <span key={i} onClick={() => setImgIdx(i)} style={{
                      width: i === imgIdx ? 22 : 8, height: 8, borderRadius: 4,
                      background: i === imgIdx ? '#e63946' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', transition: 'all 0.3s ease', display: 'inline-block',
                    }} />
                  ))}
                </div>
              )}

              {/* Badge condicion */}
              <span style={{
                position: 'absolute', top: 14, left: 14,
                background: vehiculo.condicion === 'nuevo' ? '#e63946' : '#f4845f',
                color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1,
                padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase',
              }}>{vehiculo.condicion}</span>
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {imgs.map((img, i) => (
                  <button key={i} className={`thumb-btn ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                    style={{ flex: 1, height: 72, padding: 0, background: 'none' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://via.placeholder.com/200x100' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── COLUMNA DERECHA: info ── */}
          <div>
            {/* Estado */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: estado.bg, color: estado.color,
              fontSize: 12, fontWeight: 700, padding: '5px 14px',
              borderRadius: 20, marginBottom: 16, letterSpacing: 0.5,
            }}>
              <EstadoIcon size={13} /> {estado.label}
            </div>

            {/* Título */}
            <p style={{ fontSize: 12, color: '#e63946', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>{vehiculo.marca}</p>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text)', lineHeight: 1.15, margin: '0 0 8px' }}>
              {vehiculo.modelo}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.6em', marginLeft: 10 }}>{vehiculo.anio}</span>
            </h1>

            {/* Precio */}
            <div style={{ margin: '20px 0', padding: '16px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 4px' }}>Precio</p>
              <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 36, color: '#e63946', margin: 0, lineHeight: 1 }}>
                ${vehiculo.precio?.toLocaleString()}
              </p>
            </div>

            {/* Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <SpecCard icon={<Gauge size={16} color="#e63946" />} label="Kilometraje" value={`${vehiculo.kilometraje?.toLocaleString()} km`} />
              <SpecCard icon={<Calendar size={16} color="#e63946" />} label="Año" value={vehiculo.anio} />
              <SpecCard icon={<Wrench size={16} color="#e63946" />} label="Motor" value={vehiculo.motor} />
              <SpecCard icon={<Car size={16} color="#e63946" />} label="Tipo" value={vehiculo.tipo} />
              <SpecCard icon={<Tag size={16} color="#e63946" />} label="Condición" value={vehiculo.condicion} />
              <SpecCard icon={<CircleDot size={16} color="#e63946" />} label="Estado" value={vehiculo.estado} />
            </div>

            {/* Descripción */}
            {vehiculo.descripcion && (
              <div style={{ marginBottom: 24, padding: '16px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 8px' }}>Descripción</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{vehiculo.descripcion}</p>
              </div>
            )}

            {/* Botón reservar */}
            {mensaje ? (
              <div style={{
                padding: '14px 20px', borderRadius: 14, marginBottom: 12,
                background: mensaje.tipo === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: mensaje.tipo === 'ok' ? '#16a34a' : '#dc2626',
                fontSize: 14, fontWeight: 600, lineHeight: 1.5,
              }}>
                {mensaje.texto}
              </div>
            ) : (
              <>
                {puedeReservar && (
                  <button
                    className="reservar-btn"
                    onClick={handleReservar}
                    disabled={reservando}
                    style={{ background: 'linear-gradient(90deg, #e63946 0%, #f4845f 100%)', color: '#fff', marginBottom: 10 }}
                  >
                    {reservando ? 'Reservando...' : '🔒 Reservar vehículo'}
                  </button>
                )}
                {!usuario && (
                  <button className="reservar-btn" onClick={() => navigate('/login')}
                    style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1.5px solid var(--input-border)' }}>
                    Iniciá sesión para reservar
                  </button>
                )}
                {usuario?.rol !== 'cliente' && usuario && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>Solo los clientes pueden reservar vehículos</p>
                )}
                {vehiculo.estado !== 'disponible' && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                    Este vehículo no está disponible para reservar
                  </p>
                )}
              </>
            )}

            {/* Contacto */}
            <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px' }}>¿Tenés dudas?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ContactRow icon={<Phone size={14} color="#e63946" />} text="+54 11 1234-5678" />
                <ContactRow icon={<Mail size={14} color="#e63946" />} text="info@autocare.com.ar" />
                <ContactRow icon={<MapPin size={14} color="#e63946" />} text="Av. Corrientes 1234, CABA" />
              </div>
            </div>
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

function SpecCard({ icon, label, value }) {
  return (
    <div className="spec-card">
      {icon}
      <div>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>{value}</p>
      </div>
    </div>
  )
}

function ContactRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
      {icon} {text}
    </div>
  )
}

const btnSecondaryStyle = {
  marginTop: 16, padding: '10px 24px', borderRadius: 12,
  background: 'none', border: '1.5px solid var(--input-border)',
  color: 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
}