import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Trophy, Star, ShieldCheck, Search, Gauge, ChevronLeft, ChevronRight, X, User } from 'lucide-react'
import ToggleTema from '../components/ToggleTema'
import { getVehiculos } from '../api/vehiculos'
import { useAuth } from '../context/AuthContext'

const TIPOS = ['Todos', 'auto', 'moto', 'camioneta']
const MARCAS = ['Todas', 'Toyota', 'Ford', 'Chevrolet', 'Honda', 'BMW']
const CONDICIONES = ['Todas', 'nuevo', 'usado']
const PER_PAGE = 10

function VehicleCard({ vehiculo }) {
  const [imgIdx, setImgIdx] = useState(0)
  const navigate = useNavigate()
  const imgs = vehiculo.imagenes || []

  const prev = (e) => { e.stopPropagation(); setImgIdx((p) => (p - 1 + imgs.length) % imgs.length) }
  const next = (e) => { e.stopPropagation(); setImgIdx((p) => (p + 1) % imgs.length) }

  return (
    <div className="card-hover" style={{
      background: 'var(--bg-card)',
      boxShadow: '0 4px 24px var(--shadow)',
      border: '1px solid var(--border)',
      borderRadius: 18,
      overflow: 'hidden',
      transition: 'transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s',
    }}>
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        {imgs.length > 0 ? (
          <img src={imgs[imgIdx]?.url} alt={vehiculo.modelo}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Sin+imagen' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <span style={{ color: '#c0392b', fontSize: 14, opacity: 0.5 }}>Sin imagen</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
        {imgs.length > 1 && (
          <>
            <button onClick={prev} className="arrow-btn" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}><ChevronLeft size={18} /></button>
            <button onClick={next} className="arrow-btn" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}><ChevronRight size={18} /></button>
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {imgs.map((_, i) => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                  background: i === imgIdx ? '#e63946' : 'rgba(255,255,255,0.55)',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
          </>
        )}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          background: vehiculo.condicion === 'nuevo' ? '#e63946' : '#f4845f',
          color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1,
          padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
        }}>{vehiculo.condicion}</span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div>
            <span style={{ fontSize: 11, color: '#e63946', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{vehiculo.marca}</span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, fontFamily: "'Sora', sans-serif", margin: 0 }}>
              {vehiculo.modelo} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 15 }}>{vehiculo.anio}</span>
            </h3>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#e63946', whiteSpace: 'nowrap', fontFamily: "'Sora', sans-serif" }}>
            ${vehiculo.precio?.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Chip icon={<Gauge size={12} color="#c0392b" />} label={`${vehiculo.kilometraje?.toLocaleString()} km`} />
          <Chip icon={<Car size={12} color="#c0392b" />} label={vehiculo.tipo} />
        </div>

        <button
          style={{
            marginTop: 14, width: '100%', padding: '9px 0', borderRadius: 12,
            background: 'linear-gradient(90deg, #e63946 0%, #f4845f 100%)',
            color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            letterSpacing: 0.5, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}
        >
          Ver detalles →
        </button>
      </div>
    </div>
  )
}

function Chip({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--chip-bg)', color: '#c0392b', fontSize: 12, fontWeight: 600,
      padding: '3px 10px', borderRadius: 20, border: '1px solid var(--chip-border)',
    }}>
      {icon} {label}
    </span>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({ tipo: '', marca: '', condicion: '', anioMin: '', anioMax: '', precioMax: '' })
  const [pagina, setPagina] = useState(1)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 80)
    getVehiculos()
      .then(data => setVehiculos(Array.isArray(data) ? data : data.vehiculos ?? data.data ?? []))
      .catch(() => setError('No se pudo cargar los vehículos. Verificá que el servidor esté corriendo.'))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = vehiculos.filter(v => {
    if (filtros.tipo && filtros.tipo !== 'Todos' && v.tipo !== filtros.tipo) return false
    if (filtros.marca && filtros.marca !== 'Todas' && v.marca !== filtros.marca) return false
    if (filtros.condicion && filtros.condicion !== 'Todas' && v.condicion !== filtros.condicion) return false
    if (filtros.anioMin && v.anio < Number(filtros.anioMin)) return false
    if (filtros.anioMax && v.anio > Number(filtros.anioMax)) return false
    if (filtros.precioMax && v.precio > Number(filtros.precioMax)) return false
    return true
  })

  const totalPags = Math.ceil(filtrados.length / PER_PAGE)
  const paginados = filtrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE)
  const [filtrando, setFiltrando] = useState(false)

  const setFiltro = (key, val) => {
    setFiltrando(true)
    setFiltros(f => ({ ...f, [key]: val }))
    setPagina(1)
    setTimeout(() => setFiltrando(false), 400)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .card-hover:hover { transform: translateY(-5px) !important; box-shadow: 0 12px 40px rgba(180,40,20,0.18) !important; }
        .arrow-btn { background: rgba(255,255,255,0.92); border: none; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #e63946; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: background 0.2s; }
        .arrow-btn:hover { background: #fff; }
        .filter-input { width: 100%; padding: 9px 14px; border-radius: 12px; border: 1.5px solid var(--input-border); background: var(--bg-card); color: var(--text); font-size: 13px; outline: none; transition: border 0.2s; font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .filter-input:focus { border-color: #e63946; }
        .page-btn { width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid var(--input-border); background: var(--bg-card); color: var(--text-muted); font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
        .page-btn:hover { background: #e63946; color: #fff; border-color: #e63946; }
        .page-btn.active { background: linear-gradient(90deg,#e63946,#f4845f); color: #fff; border-color: transparent; }
        .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .hero-fade { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .hero-fade.visible { opacity: 1; transform: translateY(0); }
        @keyframes spin { to { transform: rotate(360deg) } }
        .spinner-red { width: 16px; height: 16px; border: 2px solid rgba(230,57,70,0.2); border-top-color: #e63946; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        .nav-mobile { display: none; }
        @media (max-width: 640px) {
          .hero-section { padding: 40px 5vw 32px !important; }
          .filtros-section { padding: 20px 5vw 0 !important; }
          .grid-vehiculos { grid-template-columns: 1fr !important; }
          .grid-section { padding: 20px 5vw 32px !important; }
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; gap: 8px; align-items: center; }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Auto Care" style={{ height: 40, width: 40, objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none' }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 20, color: '#e63946', letterSpacing: -0.5 }}>
            AUTO <span style={{ color: 'var(--text)' }}>CARE</span>
          </span>
        </div>
        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ToggleTema />
          {usuario ? (
            <button onClick={() => navigate(usuario.rol === 'admin' || usuario.rol === 'empleado' ? '/admin' : '/perfil')}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: 'linear-gradient(90deg,#e63946,#f4845f)', color: '#fff',
                border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
              <User size={15} />
              {usuario.nombre ?? usuario.email?.split('@')[0]}
            </button>
          ) : (
            <>
              <NavLink href="/login">Ingresar</NavLink>
              <NavLink href="/register" primary>Registrarse</NavLink>
            </>
          )}
        </div>

        {/* Mobile nav */}
        <div className="nav-mobile">
          <ToggleTema />
          <button
            onClick={() => navigate(
              usuario
                ? (usuario.rol === 'admin' || usuario.rol === 'empleado' ? '/admin' : '/perfil')
                : '/login'
            )}
            style={{
              background: usuario ? 'linear-gradient(90deg,#e63946,#f4845f)' : 'rgba(230,57,70,0.08)',
              border: usuario ? 'none' : '1.5px solid rgba(230,57,70,0.25)',
              borderRadius: 10, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <User size={17} color={usuario ? '#fff' : '#e63946'} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{
        padding: '72px 5vw 56px',
        background: 'var(--bg-hero)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-80px', top: '-80px',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className={`hero-fade ${heroVisible ? 'visible' : ''}`} style={{ maxWidth: 640 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(90deg,#e63946,#f4845f)',
            color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 2.5,
            padding: '5px 16px', borderRadius: 30, marginBottom: 18, textTransform: 'uppercase',
          }}>
            <Car size={14} /> Tu próximo auto, a un click
          </span>
          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 5vw, 54px)',
            color: 'var(--text)', lineHeight: 1.12, marginBottom: 18,
          }}>
            Encontrá el vehículo<br />
            <span style={{ color: '#e63946' }}>perfecto para vos</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
            En <strong style={{ color: '#e63946' }}>Auto Care</strong> te ofrecemos los mejores vehículos con garantía, financiación y la atención que merecés. Calidad que se ve, confianza que se siente.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatPill icon={<Trophy size={20} color="#e63946" />} value="+500" label="Vehículos vendidos" />
            <StatPill icon={<Star size={20} color="#e63946" />} value="4.9" label="Satisfacción" />
            <StatPill icon={<ShieldCheck size={20} color="#e63946" />} value="100%" label="Garantía" />
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="filtros-section" style={{ padding: '32px 5vw 0' }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 20, padding: '24px 28px',
          boxShadow: '0 4px 24px var(--shadow)', border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={16} color="#e63946" /> Filtrá tu búsqueda
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { key: 'tipo', label: 'Tipo', opts: TIPOS, isSelect: true },
              { key: 'marca', label: 'Marca', opts: MARCAS, isSelect: true },
              { key: 'condicion', label: 'Condición', opts: CONDICIONES, isSelect: true },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <select className="filter-input" value={filtros[key]} onChange={e => setFiltro(key, e.target.value)}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={labelStyle}>Año mín.</label>
              <input className="filter-input" type="number" placeholder="2015" value={filtros.anioMin} onChange={e => setFiltro('anioMin', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Año máx.</label>
              <input className="filter-input" type="number" placeholder="2024" value={filtros.anioMax} onChange={e => setFiltro('anioMax', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Precio máx. $</label>
              <input className="filter-input" type="number" placeholder="50000" value={filtros.precioMax} onChange={e => setFiltro('precioMax', e.target.value)} />
            </div>
          </div>
          {Object.values(filtros).some(Boolean) && (
            <button onClick={() => { setFiltros({ tipo: '', marca: '', condicion: '', anioMin: '', anioMax: '', precioMax: '' }); setPagina(1) }}
              style={{ marginTop: 14, fontSize: 12, color: '#e63946', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={12} /> Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {/* GRID */}
      <section className="grid-section" style={{ padding: '32px 5vw 48px' }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          Vehículos disponibles
          <span style={{ fontSize: 14, color: '#e63946', fontWeight: 600 }}>({filtrados.length})</span>
          {filtrando && <span className="spinner-red" />}
        </h2>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid #e63946', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ fontSize: 14 }}>Cargando vehículos...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Car size={48} color="#e63946" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 15, color: '#e63946', fontWeight: 600 }}>{error}</p>
          </div>
        ) : paginados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Car size={48} color="#e63946" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 16 }}>No hay vehículos con esos filtros</p>
          </div>
        ) : (
          <div className="grid-vehiculos" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {paginados.map(v => <VehicleCard key={v.id} vehiculo={v} />)}
          </div>
        )}

        {totalPags > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
            <button className="page-btn" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPags }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${n === pagina ? 'active' : ''}`} onClick={() => setPagina(n)}>{n}</button>
            ))}
            <button className="page-btn" onClick={() => setPagina(p => Math.min(totalPags, p + 1))} disabled={pagina === totalPags}><ChevronRight size={16} /></button>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-footer)', color: '#aaa', textAlign: 'center', padding: '28px 5vw', fontSize: 13 }}>
        <span style={{ color: '#e63946', fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>AUTO CARE</span>
        {' '}— Todos los derechos reservados © {new Date().getFullYear()}
      </footer>
    </div>
  )
}

function NavLink({ href, children, primary }) {
  return (
    <a href={href} style={{
      padding: '8px 18px', borderRadius: 12, fontWeight: 600, fontSize: 14,
      textDecoration: 'none', transition: 'all 0.18s',
      background: primary ? 'linear-gradient(90deg,#e63946,#f4845f)' : 'transparent',
      color: primary ? '#fff' : 'var(--text-muted)',
      border: primary ? 'none' : '1.5px solid var(--input-border)',
    }}>{children}</a>
  )
}

function StatPill({ icon, value, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--bg-card)', borderRadius: 14, padding: '10px 18px',
      boxShadow: '0 2px 12px var(--shadow)', border: '1px solid var(--border)',
    }}>
      {icon}
      <div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{label}</div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }