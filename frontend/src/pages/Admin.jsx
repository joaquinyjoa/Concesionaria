import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Car, Users, UserCog, ShoppingBag, BarChart2, LogOut,
  Search, Plus, Edit2, Trash2, X, Check, ChevronLeft, ChevronRight,
  Download, ZoomIn, AlertTriangle, Menu, ArrowLeft, Upload, Image as ImageIcon,
  Moon, Sun, UserPlus, Tag, FileText, Bell, Phone, Mail
} from 'lucide-react'
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from '../api/notificaciones'
import { useAuth } from '../context/AuthContext'
import { useTema } from '../context/ThemeContext'
import { getVehiculos, crearVehiculo, actualizarVehiculo, eliminarVehiculo } from '../api/vehiculos'
import { getVentas, crearVenta } from '../api/ventas'
import { subirImagen, eliminarImagen } from '../api/imagenes'
import { crearEmpleado } from '../api/auth'
import api from '../api/axios'

const R = '#e63946'
const G = 'linear-gradient(90deg, #e63946 0%, #f4845f 100%)'
const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

// ─────────────────────────────────────────────────────────────────────────────
// GENERADOR DE TICKET PDF (sin dependencias externas — usa Canvas API)
// ─────────────────────────────────────────────────────────────────────────────
function generarTicketPDF({ venta, vehiculo, cliente, empleado }) {
  const canvas = document.createElement('canvas')
  const W = 595, H = 842
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fondo blanco
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Header rojo degradado
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0, '#e63946')
  grad.addColorStop(1, '#f4845f')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, 120)

  // Título
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px Arial'
  ctx.fillText('AUTO CARE', 40, 52)
  ctx.font = '16px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('Comprobante de Compra', 40, 78)

  // Número de venta
  ctx.font = 'bold 18px Arial'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'right'
  ctx.fillText(`Venta #${venta.id}`, W - 40, 52)
  ctx.font = '13px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText(new Date(venta.fecha_venta || Date.now()).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric'
  }), W - 40, 78)
  ctx.textAlign = 'left'

  // Sección datos del cliente
  let y = 160
  const drawSection = (title, items) => {
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(40, y - 8, W - 80, 28)
    ctx.fillStyle = '#e63946'
    ctx.font = 'bold 13px Arial'
    ctx.fillText(title.toUpperCase(), 52, y + 12)
    y += 36

    items.forEach(([label, val]) => {
      if (!val) return
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px Arial'
      ctx.fillText(label, 52, y)
      ctx.fillStyle = '#111827'
      ctx.font = '13px Arial'
      ctx.fillText(String(val), 200, y)
      y += 24
    })
    y += 12
  }

  drawSection('Datos del cliente', [
    ['Nombre:', `${cliente?.nombre ?? ''} ${cliente?.apellido ?? ''}`],
    ['DNI:', cliente?.documento],
    ['Email:', cliente?.email],
    ['Teléfono:', cliente?.telefono],
    ['Localidad:', cliente?.localidad],
  ])

  drawSection('Vehículo adquirido', [
    ['Vehículo:', `${vehiculo?.marca ?? ''} ${vehiculo?.modelo ?? ''}`],
    ['Tipo:', capitalize(vehiculo?.tipo)],
    ['Año:', vehiculo?.anio],
    ['Motor:', vehiculo?.motor],
    ['Kilometraje:', vehiculo?.kilometraje ? `${vehiculo.kilometraje} km` : null],
    ['Condición:', capitalize(vehiculo?.condicion)],
  ])

  drawSection('Datos de la venta', [
    ['Vendedor:', empleado ? `${empleado.nombre} ${empleado.apellido}` : '—'],
    ['Método de pago:', capitalize(venta.metodo_pago)],
    ['Precio de venta:', fmt(venta.precio_venta)],
  ])

  // Precio destacado
  ctx.fillStyle = G
  const priceGrad = ctx.createLinearGradient(40, y, W - 80, y)
  priceGrad.addColorStop(0, '#e63946')
  priceGrad.addColorStop(1, '#f4845f')
  ctx.fillStyle = priceGrad
  ctx.fillRect(40, y, W - 80, 64)
  ctx.fillStyle = '#ffffff'
  ctx.font = '14px Arial'
  ctx.fillText('TOTAL ABONADO', 60, y + 24)
  ctx.font = 'bold 28px Arial'
  ctx.fillText(fmt(venta.precio_venta), 60, y + 52)
  y += 80

  // Pie
  ctx.fillStyle = '#9ca3af'
  ctx.font = '11px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Este comprobante es válido como constancia de compra. Auto Care — ' +
    new Date().getFullYear(), W / 2, H - 40)
  ctx.textAlign = 'left'

  // Descargar
  const link = document.createElement('a')
  link.download = `ticket-venta-${venta.id}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function Admin() {
  const { usuario, logout } = useAuth()
  const { oscuro, toggleTema } = useTema()
  const navigate = useNavigate()
  const [seccion, setSeccion] = useState('vehiculos')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const esAdmin = usuario?.rol === 'admin'
  const [notifs, setNotifs] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  const cargarNotifs = useCallback(async () => {
    try {
      const data = await getNotificaciones()
      setNotifs(Array.isArray(data) ? data : [])
    } catch {}
  }, [])

  useEffect(() => {
    cargarNotifs()
    const interval = setInterval(cargarNotifs, 30000)
    return () => clearInterval(interval)
  }, [cargarNotifs])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = async (notif) => {
    try { await marcarLeida(notif.id) } catch {}
    setNotifs(prev => prev.filter(n => n.id !== notif.id))
    setNotifOpen(false)
    setSeccion('vehiculos')
  }

  const handleLeerTodas = async () => {
    try { await marcarTodasLeidas() } catch {}
    setNotifs([])
    setNotifOpen(false)
  }

  useEffect(() => {
    if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'empleado')) navigate('/')
  }, [usuario])

  // Nav según rol
  const nav = esAdmin
    ? [
        { id: 'vehiculos',      label: 'Vehículos',      icon: Car },
        { id: 'clientes',       label: 'Clientes',       icon: Users },
        { id: 'empleados',      label: 'Empleados',      icon: UserCog },
        { id: 'ventas',         label: 'Ventas',         icon: ShoppingBag },
        { id: 'estadisticas',   label: 'Estadísticas',   icon: BarChart2 },
        { id: 'crear-empleado', label: 'Crear empleado', icon: UserPlus },
      ]
    : [
        { id: 'vehiculos', label: 'Vehículos', icon: Car },
        { id: 'ventas',    label: 'Mis ventas', icon: ShoppingBag },
      ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .spin { animation: spin 0.7s linear infinite }
        .fade-in { animation: fadeIn 0.25s ease }
        .nav-item { display:flex; align-items:center; gap:12px; padding:11px 16px; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.18s; color:var(--text-muted); border:none; background:none; width:100%; text-align:left; }
        .nav-item:hover { background:rgba(230,57,70,0.08); color:${R}; }
        .nav-item.active { background:linear-gradient(90deg,rgba(230,57,70,0.15),rgba(244,132,95,0.10)); color:${R}; }
        .admin-table { width:100%; border-collapse:collapse; }
        .admin-table th { text-align:left; padding:10px 14px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:var(--text-muted); border-bottom:1.5px solid var(--border); background:var(--bg-card); }
        .admin-table td { padding:12px 14px; font-size:13.5px; color:var(--text); border-bottom:1px solid var(--border); vertical-align:middle; }
        .admin-table tr:hover td { background:rgba(230,57,70,0.03); }
        .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
        .btn-icon { background:none; border:1.5px solid var(--border); border-radius:9px; padding:6px 8px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-muted); transition:all 0.15s; }
        .btn-icon:hover { border-color:${R}; color:${R}; background:rgba(230,57,70,0.06); }
        .btn-icon.danger:hover { border-color:#e63946; color:#e63946; background:rgba(230,57,70,0.08); }
        .btn-icon.sell { border-color:#22c55e; color:#22c55e; }
        .btn-icon.sell:hover { background:rgba(34,197,94,0.08); }
        .search-input { padding:9px 14px 9px 38px; border-radius:12px; border:1.5px solid var(--input-border); background:var(--bg); color:var(--text); font-size:13.5px; outline:none; transition:border 0.2s; font-family:'DM Sans',sans-serif; width:220px; }
        .search-input:focus { border-color:${R}; box-shadow:0 0 0 3px rgba(230,57,70,0.08); }
        .filter-sel { padding:8px 12px; border-radius:10px; border:1.5px solid var(--input-border); background:var(--bg); color:var(--text); font-size:13px; outline:none; font-family:'DM Sans',sans-serif; cursor:pointer; }
        .filter-sel:focus { border-color:${R}; }
        .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
        .modal { background:var(--bg-card); border-radius:20px; padding:28px; width:min(560px,95vw); max-height:92vh; overflow-y:auto; border:1px solid var(--border); box-shadow:0 24px 80px rgba(0,0,0,0.3); }
        .modal-input { width:100%; padding:10px 14px; border-radius:11px; border:1.5px solid var(--input-border); background:var(--bg); color:var(--text); font-size:14px; outline:none; font-family:'DM Sans',sans-serif; box-sizing:border-box; transition:border 0.2s; }
        .modal-input:focus { border-color:${R}; box-shadow:0 0 0 3px rgba(230,57,70,0.08); }
        .primary-btn { padding:10px 20px; border-radius:12px; background:${G}; color:#fff; border:none; font-weight:700; font-size:14px; cursor:pointer; font-family:'Sora',sans-serif; transition:opacity 0.2s,transform 0.15s; display:flex; align-items:center; gap:8px; }
        .primary-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
        .primary-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; }
        .page-btn { width:32px; height:32px; border-radius:8px; border:1.5px solid var(--border); background:var(--bg-card); color:var(--text-muted); font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
        .page-btn:hover:not(:disabled) { background:${R}; color:#fff; border-color:${R}; }
        .page-btn.active { background:${G}; color:#fff; border-color:transparent; }
        .page-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .sidebar-logo { font-family:'Sora',sans-serif; font-weight:800; font-size:18px; background:${G}; -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .stat-card { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:20px; flex:1; min-width:140px; }
        .modal-label { display:block; font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
        .tema-btn { background:none; border:1.5px solid var(--border); border-radius:10px; padding:6px 12px; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .tema-btn:hover { border-color:${R}; color:${R}; }
        .cliente-result { padding:10px 14px; border-radius:10px; cursor:pointer; border:1.5px solid var(--border); background:var(--bg); transition:all 0.15s; }
        .cliente-result:hover { border-color:${R}; background:rgba(230,57,70,0.04); }
        .cliente-result.selected { border-color:#22c55e; background:rgba(34,197,94,0.06); }
        .notif-item { padding:12px 16px; cursor:pointer; border-bottom:1px solid var(--border); transition:background 0.15s; display:flex; flex-direction:column; gap:3px; }
        .notif-item:hover { background:rgba(230,57,70,0.05); }
        .notif-item:last-child { border-bottom:none; }
        @keyframes notifPop { 0%{transform:scale(0.7);opacity:0} 100%{transform:scale(1);opacity:1} }
        .notif-badge { animation: notifPop 0.2s ease; }
        @media (max-width: 768px) {
          .admin-sidebar { position:fixed !important; left:0; top:0; height:100vh; z-index:200; box-shadow:4px 0 24px rgba(0,0,0,0.18); }
          .search-input { width:140px !important; }
          .admin-table-wrap { overflow-x: auto; }
          .admin-table th:nth-child(n+5), .admin-table td:nth-child(n+5) { display:none; }
          .stat-cards-row { flex-wrap: wrap !important; }
          .stat-card { min-width: calc(50% - 8px) !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .header-actions { gap: 8px !important; }
          .modal { padding: 20px !important; }
        }
        @media (max-width: 480px) {
          .stat-card { min-width: 100% !important; }
          .search-input { width: 110px !important; }
          .btn-icon span { display: none; }
        }
      `}</style>

      {/* OVERLAY en mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199, backdropFilter: 'blur(2px)' }} />
      )}

      {/* SIDEBAR */}
      <aside className="admin-sidebar" style={{
        width: sidebarOpen ? 220 : 0, minWidth: sidebarOpen ? 220 : 0,
        background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'width 0.25s, min-width 0.25s',
        position: isMobile ? 'fixed' : 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={17} color="#fff" />
            </div>
            <span className="sidebar-logo">Auto Care</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, paddingLeft: 2 }}>
            {capitalize(usuario?.rol)} · {usuario?.email}
          </div>
        </div>
        <nav style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${seccion === id ? 'active' : ''}`} onClick={() => { setSeccion(id); if (isMobile) setSidebarOpen(false) }}>
              <Icon size={17} /><span style={{ whiteSpace: 'nowrap' }}>{label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button className="nav-item" onClick={() => navigate('/')}><ArrowLeft size={16} /> Ver sitio</button>
          <button className="nav-item" onClick={() => { logout(); navigate('/') }}><LogOut size={16} /> Cerrar sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'var(--bg-nav)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px', height: 60,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
            <Menu size={20} />
          </button>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', flex: 1 }}>
            {nav.find(n => n.id === seccion)?.label}
          </h1>
          <button className="tema-btn" onClick={toggleTema}>
            {oscuro ? <Sun size={15} /> : <Moon size={15} />}
            {oscuro ? 'Claro' : 'Oscuro'}
          </button>

          {/* CAMPANITA */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              style={{ position: 'relative', background: 'none', border: '1.5px solid var(--border)', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
            >
              <Bell size={17} />
              {notifs.length > 0 && (
                <span className="notif-badge" style={{ position: 'absolute', top: -6, right: -6, background: '#e63946', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-nav)' }}>
                  {notifs.length > 9 ? '9+' : notifs.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div style={{ position: 'absolute', right: 0, top: 44, width: 320, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                    Notificaciones {notifs.length > 0 && <span style={{ color: '#e63946' }}>({notifs.length})</span>}
                  </span>
                  {notifs.length > 0 && (
                    <button onClick={handleLeerTodas} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                      Leer todas
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      <Bell size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.25 }} />
                      Sin notificaciones nuevas
                    </div>
                  ) : notifs.map(n => (
                    <div key={n.id} className="notif-item" onClick={() => handleNotifClick(n)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          {n.cliente_nombre} {n.cliente_apellido}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 16 }}>
                        Reservó: <strong style={{ color: 'var(--text)' }}>{n.marca} {n.modelo}</strong>
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 16 }}>
                        {new Date(n.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '28px 24px' }} className="fade-in" key={seccion}>
          {seccion === 'vehiculos'      && <SeccionVehiculos isAdmin={esAdmin} usuario={usuario} />}
          {seccion === 'clientes'       && esAdmin && <SeccionPersonas tipo="clientes" isAdmin={esAdmin} />}
          {seccion === 'empleados'      && esAdmin && <SeccionPersonas tipo="empleados" isAdmin={esAdmin} />}
          {seccion === 'ventas'         && <SeccionVentas isAdmin={esAdmin} usuario={usuario} />}
          {seccion === 'estadisticas'   && esAdmin && <SeccionEstadisticas />}
          {seccion === 'crear-empleado' && esAdmin && <SeccionCrearEmpleado />}
        </div>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL CLIENTE QUE RESERVÓ
// ─────────────────────────────────────────────────────────────────────────────
function ModalClienteReserva({ vehiculo, onClose }) {
  const [cliente, setCliente] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        // reservado_por viene en el objeto vehiculo del getAll
        if (!vehiculo.reservado_por) { setCargando(false); return }
        const { data } = await api.get(`/clientes/${vehiculo.reservado_por}`)
        setCliente(data.cliente ?? data.data ?? data)
      } catch {}
      setCargando(false)
    }
    cargar()
  }, [vehiculo])

  return (
    <div className="modal-bg">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', margin: 0 }}>
              Cliente interesado
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {vehiculo.marca} {vehiculo.modelo} · <span style={{ color: '#f59e0b', fontWeight: 700 }}>Reservado</span>
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10, color: 'var(--text-muted)' }}>
            <div style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: R, borderRadius: '50%' }} className="spin" />
            Cargando...
          </div>
        ) : !cliente ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            No se encontró información del cliente.
          </p>
        ) : (
          <>
            {/* Avatar + nombre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '16px', background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#e63946,#f4845f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
                {cliente.nombre?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                  {cliente.nombre} {cliente.apellido}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>DNI: {cliente.documento}</div>
              </div>
            </div>

            {/* Datos de contacto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cliente.telefono && (
                <a href={`tel:${cliente.telefono}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.15s' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={15} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1 }}>Teléfono</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{cliente.telefono}</div>
                  </div>
                </a>
              )}
              {cliente.email && (
                <a href={`mailto:${cliente.email}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.25)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.15s' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={15} color="#6366f1" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>Email</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{cliente.email}</div>
                  </div>
                </a>
              )}
              {cliente.localidad && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(230,57,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={15} color={R} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Localidad</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{cliente.localidad}</div>
                  </div>
                </div>
              )}
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
              Hacé click en teléfono o email para contactar directamente
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI CARRUSEL
// ─────────────────────────────────────────────────────────────────────────────
function MiniCarousel({ imagenes, onZoom }) {
  const [idx, setIdx] = useState(0)
  if (!imagenes.length) return (
    <div style={{ width: 110, height: 76, borderRadius: 10, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Car size={20} color="var(--text-muted)" />
    </div>
  )
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + imagenes.length) % imagenes.length) }
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % imagenes.length) }
  return (
    <div style={{ position: 'relative', width: 110, height: 76, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--border)', cursor: 'zoom-in' }} onClick={() => onZoom(imagenes[idx].url)}>
      <img src={imagenes[idx].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {imagenes.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: 3, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ChevronLeft size={11} /></button>
          <button onClick={next} style={{ position: 'absolute', right: 3, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ChevronRight size={11} /></button>
          <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3 }}>
            {imagenes.map((_, i) => (
              <div key={i} style={{ width: i === idx ? 10 : 5, height: 5, borderRadius: 99, background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL MARCAR COMO VENDIDO
// ─────────────────────────────────────────────────────────────────────────────
function ModalVenderVehiculo({ vehiculo, onClose, onSuccess, usuario }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const buscarCliente = (q) => {
    setBusqueda(q)
    setClienteSeleccionado(null)
    clearTimeout(debounceRef.current)
    if (q.trim().length < 2) { setResultados([]); return }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true)
      try {
        const { data } = await api.get(`/clientes/buscar?q=${encodeURIComponent(q.trim())}`)
        setResultados(Array.isArray(data) ? data : [])
      } catch { setResultados([]) }
      setBuscando(false)
    }, 350)
  }

  const confirmarVenta = async () => {
    if (!clienteSeleccionado) { setError('Seleccioná un cliente.'); return }
    setError(null)
    setGuardando(true)
    try {
      const ventaData = await crearVenta({
        vehiculo_id: vehiculo.id,
        cliente_id: clienteSeleccionado.id,
        precio_venta: vehiculo.precio,
        metodo_pago: metodoPago,
      })

      // Obtener datos del empleado para el ticket
      let empleado = null
      try {
        const empRes = await api.get('/empleados/me')
        empleado = empRes.data
      } catch {}

      // Generar ticket PDF
      generarTicketPDF({
        venta: { ...ventaData, precio_venta: ventaData.precio_venta ?? vehiculo.precio },
        vehiculo,
        cliente: clienteSeleccionado,
        empleado,
      })

      onSuccess()
    } catch (e) {
      setError(e.response?.data?.error ?? 'Error al registrar la venta.')
    }
    setGuardando(false)
  }

  return (
    <div className="modal-bg">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', margin: 0 }}>Registrar venta</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {vehiculo.marca} {vehiculo.modelo} · <strong style={{ color: '#e63946' }}>{fmt(vehiculo.precio)}</strong>
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Buscador de cliente */}
        <div style={{ marginBottom: 16 }}>
          <label className="modal-label">Buscar cliente por nombre o DNI</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="modal-input"
              style={{ paddingLeft: 36 }}
              placeholder="Ej: Juan García o 12345678"
              value={busqueda}
              onChange={e => buscarCliente(e.target.value)}
            />
          </div>

          {buscando && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 2px', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: '#e63946', borderRadius: '50%' }} className="spin" />
              Buscando...
            </div>
          )}

          {resultados.length > 0 && !clienteSeleccionado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {resultados.map(c => (
                <div
                  key={c.id}
                  className="cliente-result"
                  onClick={() => { setClienteSeleccionado(c); setResultados([]) }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{c.nombre} {c.apellido}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>DNI: {c.documento} · {c.email}</div>
                </div>
              ))}
            </div>
          )}

          {busqueda.length >= 2 && !buscando && resultados.length === 0 && !clienteSeleccionado && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Sin resultados. El cliente debe estar registrado en el sistema.</p>
          )}
        </div>

        {/* Cliente seleccionado */}
        {clienteSeleccionado && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>DNI: {clienteSeleccionado.documento}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={16} color="#22c55e" />
              <button className="btn-icon" style={{ padding: '4px 6px' }} onClick={() => { setClienteSeleccionado(null); setBusqueda('') }}><X size={13} /></button>
            </div>
          </div>
        )}

        {/* Método de pago */}
        <div style={{ marginBottom: 20 }}>
          <label className="modal-label">Método de pago</label>
          <select className="modal-input" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="financiado">Financiado</option>
          </select>
        </div>

        {/* Info ticket */}
        <div style={{ background: 'rgba(99,102,241,0.07)', border: '1.5px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={15} color="#6366f1" />
          <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 500 }}>Al confirmar se descargará automáticamente el ticket de compra.</span>
        </div>

        {error && (
          <div style={{ background: 'rgba(230,57,70,0.08)', border: '1.5px solid rgba(230,57,70,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} color="#e63946" />
            <span style={{ fontSize: 13, color: '#e63946' }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-icon" style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600 }} onClick={onClose}>Cancelar</button>
          <button
            className="primary-btn"
            style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a)' }}
            onClick={confirmarVenta}
            disabled={guardando || !clienteSeleccionado}
          >
            {guardando ? <><span className="spinner spin" /> Registrando...</> : <><Check size={15} /> Confirmar venta</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN VEHÍCULOS
// ─────────────────────────────────────────────────────────────────────────────
function SeccionVehiculos({ isAdmin, usuario }) {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [modal, setModal] = useState(null)
  const [imgZoom, setImgZoom] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [modalVender, setModalVender] = useState(null)
  const [modalCliente, setModalCliente] = useState(null)
  const PER = 8

  const cargar = async () => {
    setCargando(true)
    try { setLista(await getVehiculos()) } catch {}
    setCargando(false)
  }
  useEffect(() => { cargar() }, [])

  const vArr = Array.isArray(lista) ? lista : lista.vehiculos ?? lista.data ?? []
  const filtrados = vArr.filter(v =>
    (!busqueda || `${v.marca} ${v.modelo}`.toLowerCase().includes(busqueda.toLowerCase()))
    && (filtroTipo === 'todos' || v.tipo?.toLowerCase() === filtroTipo)
    && (filtroEstado === 'todos' || v.estado?.toLowerCase() === filtroEstado)
  )
  const totalPags = Math.max(1, Math.ceil(filtrados.length / PER))
  const pag = filtrados.slice((pagina - 1) * PER, pagina * PER)

  const handleDelete = async (id) => {
    try { await eliminarVehiculo(id); cargar() } catch {}
    setConfirmDel(null)
  }

  const estadoBadge = (e) => {
    const key = e?.toLowerCase()
    const map = { disponible: ['#22c55e', 'rgba(34,197,94,0.12)'], reservado: ['#f59e0b', 'rgba(245,158,11,0.12)'], vendido: ['#6b7280', 'rgba(107,114,128,0.12)'] }
    const [color, bg] = map[key] ?? ['#6b7280', 'rgba(107,114,128,0.12)']
    return <span className="badge" style={{ color, background: bg }}>{capitalize(e)}</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="search-input" placeholder="Buscar marca o modelo..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} />
        </div>
        <select className="filter-sel" value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1) }}>
          <option value="todos">Todos los tipos</option>
          {['auto', 'moto', 'camioneta'].map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
        </select>
        <select className="filter-sel" value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }}>
          <option value="todos">Todos los estados</option>
          {['disponible', 'reservado', 'vendido'].map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="primary-btn" onClick={() => setModal({ modo: 'crear', vehiculo: null })}>
          <Plus size={15} /> Agregar vehículo
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {cargando ? <CargandoTabla /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Imágenes</th><th>Marca / Modelo</th><th>Tipo</th><th>Año</th><th>Precio</th><th>Estado</th><th>Condición</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {pag.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Sin resultados</td></tr>
                  : pag.map(v => (
                    <tr key={v.id} id={`vehiculo-row-${v.id}`}>
                      <td style={{ padding: '8px 14px' }}>
                        <MiniCarousel imagenes={v.imagenes ?? []} onZoom={setImgZoom} />
                      </td>
                      <td><span style={{ fontWeight: 700 }}>{v.marca}</span> {v.modelo}</td>
                      <td>{capitalize(v.tipo)}</td>
                      <td>{v.anio}</td>
                      <td style={{ fontWeight: 700, color: R }}>{fmt(v.precio)}</td>
                      <td>{estadoBadge(v.estado)}</td>
                      <td>{capitalize(v.condicion)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => setModal({ modo: 'editar', vehiculo: v })} title="Editar"><Edit2 size={13} /></button>
                          {v.estado?.toLowerCase() === 'disponible' && (
                            <button className="btn-icon sell" onClick={() => setModalVender(v)} title="Marcar como vendido">
                              <Tag size={13} />
                            </button>
                          )}
                          {v.estado?.toLowerCase() === 'reservado' && (
                            <button
                              className="btn-icon"
                              style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                              onClick={() => setModalCliente(v)}
                              title="Ver cliente que reservó"
                            >
                              <Users size={13} />
                            </button>
                          )}
                          {isAdmin && <button className="btn-icon danger" onClick={() => setConfirmDel(v)} title="Eliminar"><Trash2 size={13} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Paginacion pagina={pagina} total={totalPags} onChange={setPagina} count={filtrados.length} />

      {modal && <ModalVehiculo modo={modal.modo} vehiculo={modal.vehiculo} onClose={() => setModal(null)} onSuccess={() => { setModal(null); cargar() }} />}

      {modalVender && (
        <ModalVenderVehiculo
          vehiculo={modalVender}
          usuario={usuario}
          onClose={() => setModalVender(null)}
          onSuccess={() => { setModalVender(null); cargar() }}
        />
      )}

      {modalCliente && (
        <ModalClienteReserva vehiculo={modalCliente} onClose={() => setModalCliente(null)} />
      )}

      {imgZoom && (
        <div className="modal-bg" onClick={() => setImgZoom(null)}>
          <div style={{ position: 'relative' }}>
            <img src={imgZoom} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} />
            <button onClick={() => setImgZoom(null)} style={{ position: 'absolute', top: -12, right: -12, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}><X size={16} /></button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={22} color="#e63946" />
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Eliminar vehículo</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              ¿Seguro que querés eliminar <strong style={{ color: 'var(--text)' }}>{confirmDel.marca} {confirmDel.modelo}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-icon" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600 }} onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="primary-btn" style={{ background: '#e63946' }} onClick={() => handleDelete(confirmDel.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL VEHÍCULO (crear / editar)
// ─────────────────────────────────────────────────────────────────────────────
function ModalVehiculo({ modo, vehiculo, onClose, onSuccess }) {
  const [form, setForm] = useState(vehiculo ? {
    marca: vehiculo.marca ?? '', modelo: vehiculo.modelo ?? '',
    tipo: vehiculo.tipo ?? 'auto', anio: vehiculo.anio ?? '',
    motor: vehiculo.motor ?? '', kilometraje: vehiculo.kilometraje ?? '',
    condicion: vehiculo.condicion ?? 'usado', estado: vehiculo.estado ?? 'disponible',
    precio: vehiculo.precio ?? '', descripcion: vehiculo.descripcion ?? '',
  } : { marca: '', modelo: '', tipo: 'auto', anio: '', motor: '', kilometraje: '', condicion: 'usado', estado: 'disponible', precio: '', descripcion: '' })

  const [imagenes, setImagenes] = useState(vehiculo?.imagenes ?? [])
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [vehiculoId, setVehiculoId] = useState(vehiculo?.id ?? null)
  const [error, setError] = useState(null)
  const [imgZoom, setImgZoom] = useState(null)
  const [fase, setFase] = useState(modo === 'editar' ? 'editar' : 'form')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGuardar = async () => {
    setError(null)
    setGuardando(true)
    try {
      if (modo === 'crear') {
        const nuevo = await crearVehiculo(form)
        const id = nuevo.id ?? nuevo.vehiculo?.id ?? nuevo.data?.id
        setVehiculoId(id)
        setFase('imagenes')
      } else {
        await actualizarVehiculo(vehiculo.id, form)
        onSuccess()
      }
    } catch (e) {
      setError(e.response?.data?.error ?? 'Error al guardar.')
    }
    setGuardando(false)
  }

  const handleSubirImagen = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const id = vehiculoId ?? vehiculo?.id
    if (!id) return
    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await subirImagen(id, formData)
      const nueva = res.imagen ?? res.data ?? res
      setImagenes(imgs => [...imgs, nueva])
    } catch (e) {
      setError(e.response?.data?.error ?? 'Error al subir imagen.')
    }
    setSubiendo(false)
    e.target.value = ''
  }

  const handleEliminarImagen = async (imgId) => {
    try {
      await eliminarImagen(imgId)
      setImagenes(imgs => imgs.filter(i => i.id !== imgId))
    } catch {
      setError('Error al eliminar imagen.')
    }
  }

  const campo = (label, key, type = 'text', opts = null) => (
    <div>
      <label className="modal-label">{label}</label>
      {opts
        ? <select className="modal-input" value={form[key]} onChange={e => set(key, e.target.value)}>
            {opts.map(o => <option key={o} value={o}>{capitalize(o)}</option>)}
          </select>
        : <input className="modal-input" type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
      }
    </div>
  )

  const SeccionImagenes = ({ modoDisplay }) => (
    <div style={{ marginTop: modoDisplay === 'editar' ? 20 : 0, borderTop: modoDisplay === 'editar' ? '1px solid var(--border)' : 'none', paddingTop: modoDisplay === 'editar' ? 16 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <label className="modal-label" style={{ marginBottom: 0 }}>Imágenes ({imagenes.length}/3)</label>
        {imagenes.length < 3 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 14px', borderRadius: 10, background: modoDisplay === 'imagenes' ? 'linear-gradient(90deg,#e63946,#f4845f)' : 'none', border: modoDisplay === 'imagenes' ? 'none' : '1.5px solid var(--border)', fontSize: 13, fontWeight: 700, color: modoDisplay === 'imagenes' ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
            {subiendo ? <><span className="spinner spin" style={modoDisplay === 'imagenes' ? {} : { border: '2px solid rgba(230,57,70,0.2)', borderTopColor: R }} /> Subiendo...</> : <><Upload size={13} /> Subir imagen</>}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSubirImagen} disabled={subiendo} />
          </label>
        )}
      </div>
      {imagenes.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {imagenes.map((img) => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
              <img src={img.url} alt="" style={{ width: modoDisplay === 'imagenes' ? 120 : 90, height: modoDisplay === 'imagenes' ? 90 : 68, objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} onClick={() => setImgZoom(img.url)} />
              <button onClick={() => handleEliminarImagen(img.id)} style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13, border: modoDisplay === 'imagenes' ? '2px dashed var(--border)' : 'none', borderRadius: 12 }}>
          <ImageIcon size={24} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.35 }} />
          {modoDisplay === 'imagenes' ? 'Aún no subiste imágenes' : 'Sin imágenes todavía'}
        </div>
      )}
    </div>
  )

  return (
    <div className="modal-bg">
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>
            {modo === 'crear' ? (fase === 'imagenes' ? 'Agregar imágenes' : 'Agregar vehículo') : 'Editar vehículo'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {fase !== 'imagenes' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {campo('Marca', 'marca')}
              {campo('Modelo', 'modelo')}
              {campo('Tipo', 'tipo', 'text', ['auto', 'moto', 'camioneta'])}
              {campo('Año', 'anio', 'number')}
              {campo('Motor', 'motor')}
              {campo('Kilometraje', 'kilometraje', 'number')}
              {campo('Condición', 'condicion', 'text', ['nuevo', 'usado'])}
              {campo('Estado', 'estado', 'text', ['disponible', 'reservado', 'vendido'])}
              {campo('Precio', 'precio', 'number')}
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="modal-label">Descripción</label>
              <textarea className="modal-input" rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            {modo === 'editar' && <SeccionImagenes modoDisplay="editar" />}
          </>
        )}

        {fase === 'imagenes' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              El vehículo fue creado. Podés subir hasta 3 imágenes ahora o hacerlo después desde "Editar".
            </p>
            <SeccionImagenes modoDisplay="imagenes" />
          </>
        )}

        {error && <p style={{ color: R, fontSize: 13, marginTop: 12 }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          {fase === 'imagenes'
            ? <button className="primary-btn" onClick={onSuccess}><Check size={15} /> Listo</button>
            : <>
                <button className="btn-icon" style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600 }} onClick={onClose}>Cancelar</button>
                <button className="primary-btn" onClick={handleGuardar} disabled={guardando}>
                  {guardando ? <><span className="spinner spin" /> Guardando...</> : <><Check size={15} /> {modo === 'crear' ? 'Siguiente →' : 'Guardar'}</>}
                </button>
              </>
          }
        </div>
      </div>

      {imgZoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setImgZoom(null)}>
          <img src={imgZoom} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN PERSONAS (solo admin)
// ─────────────────────────────────────────────────────────────────────────────
function SeccionPersonas({ tipo, isAdmin }) {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [ventasDetalle, setVentasDetalle] = useState([])
  const [confirmDel, setConfirmDel] = useState(null)
  const PER = 10

  const cargar = async () => {
    setCargando(true)
    try {
      const data = await api.get(`/${tipo}`).then(r => r.data)
      setLista(Array.isArray(data) ? data : data[tipo] ?? data.data ?? [])
    } catch {}
    setCargando(false)
  }
  useEffect(() => { cargar() }, [tipo])

  const abrirDetalle = async (p) => {
    setDetalle(p)
    setVentasDetalle([])
    if (tipo === 'empleados') {
      try {
        const data = await getVentas()
        const arr = Array.isArray(data) ? data : data.ventas ?? data.data ?? []
        setVentasDetalle(arr.filter(v => v.empleado_id === p.id))
      } catch {}
    }
  }

  const filtrados = lista.filter(p => {
    const q = busqueda.toLowerCase()
    return !q || `${p.nombre} ${p.apellido} ${p.email ?? ''}`.toLowerCase().includes(q)
  })
  const totalPags = Math.max(1, Math.ceil(filtrados.length / PER))
  const pag = filtrados.slice((pagina - 1) * PER, pagina * PER)

  const handleDelete = async (id) => {
    try { await api.delete(`/${tipo}/${id}`); cargar() } catch {}
    setConfirmDel(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="search-input" placeholder="Buscar por nombre, apellido o email..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} style={{ width: 320 }} />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {cargando ? <CargandoTabla /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Teléfono</th><th>Localidad</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {pag.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Sin resultados</td></tr>
                  : pag.map(p => (
                    <tr key={p.id}>
                      <td><span style={{ fontWeight: 700 }}>{p.nombre} {p.apellido}</span></td>
                      <td>{p.documento}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.email}</td>
                      <td>{p.telefono}</td>
                      <td>{p.localidad}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => abrirDetalle(p)} title="Ver detalle"><ZoomIn size={13} /></button>
                          {isAdmin && <button className="btn-icon danger" onClick={() => setConfirmDel(p)} title="Eliminar"><Trash2 size={13} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Paginacion pagina={pagina} total={totalPags} onChange={setPagina} count={filtrados.length} />

      {detalle && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{detalle.nombre} {detalle.apellido}</h2>
              <button className="btn-icon" onClick={() => { setDetalle(null); setVentasDetalle([]) }}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[['Email', detalle.email], ['Documento', detalle.documento], ['Teléfono', detalle.telefono], ['Localidad', detalle.localidad], ['Fecha nac.', detalle.fecha_nacimiento?.slice(0, 10)]].map(([label, val]) => val && (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
            {tipo === 'empleados' && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <ShoppingBag size={14} color={R} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                    Ventas realizadas: <span style={{ color: R }}>{ventasDetalle.length}</span>
                  </span>
                </div>
                {ventasDetalle.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                    {ventasDetalle.map(v => (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{v.id} · {v.fecha_venta?.slice(0, 10)}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: R }}>{fmt(v.precio_venta)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin ventas registradas.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={22} color="#e63946" />
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Eliminar {tipo === 'clientes' ? 'cliente' : 'empleado'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              ¿Seguro que querés eliminar a <strong style={{ color: 'var(--text)' }}>{confirmDel.nombre} {confirmDel.apellido}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-icon" style={{ padding: '8px 16px', fontSize: 14 }} onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="primary-btn" style={{ background: '#e63946' }} onClick={() => handleDelete(confirmDel.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN VENTAS
// ─────────────────────────────────────────────────────────────────────────────
function SeccionVentas({ isAdmin, usuario }) {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const PER = 10

  useEffect(() => {
    getVentas().then(d => setLista(Array.isArray(d) ? d : d.ventas ?? d.data ?? []))
      .catch(() => {}).finally(() => setCargando(false))
  }, [])

  const filtrados = lista.filter(v => {
    const q = busqueda.toLowerCase()
    return !q || `${v.id} ${v.metodo_pago ?? ''} ${v.fecha_venta ?? ''}`.toLowerCase().includes(q)
  })
  const totalPags = Math.max(1, Math.ceil(filtrados.length / PER))
  const pag = filtrados.slice((pagina - 1) * PER, pagina * PER)

  const porMes = {}
  lista.forEach(v => { const m = v.fecha_venta?.slice(0, 7) ?? ''; if (m) porMes[m] = (porMes[m] || 0) + 1 })
  const meses = Object.entries(porMes).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const maxMes = Math.max(...meses.map(([, n]) => n), 1)

  return (
    <div>
      {meses.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 20 }}>
            {isAdmin ? 'Ventas por mes' : 'Mis ventas por mes'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 130 }}>
            {meses.map(([mes, n]) => (
              <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: R }}>{n}</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 90 }}>
                  <div style={{ width: '100%', height: `${(n / maxMes) * 100}%`, background: G, borderRadius: '6px 6px 0 0', minHeight: 4, transition: 'height 0.6s ease' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{mes.slice(5)}/{mes.slice(2, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="search-input" placeholder="Buscar..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} />
        </div>
        <div style={{ flex: 1 }} />
        {isAdmin && <ExportBtn data={lista} nombre="ventas" label="Exportar CSV" />}
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {cargando ? <CargandoTabla /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Vehículo ID</th><th>Cliente ID</th>
                  {isAdmin && <th>Empleado ID</th>}
                  <th>Fecha</th><th>Precio venta</th><th>Método pago</th>
                </tr>
              </thead>
              <tbody>
                {pag.length === 0
                  ? <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Sin ventas registradas</td></tr>
                  : pag.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{v.id}</td>
                      <td>{v.vehiculo_id}</td>
                      <td>{v.cliente_id}</td>
                      {isAdmin && <td>{v.empleado_id}</td>}
                      <td>{v.fecha_venta?.slice(0, 10)}</td>
                      <td style={{ fontWeight: 700, color: R }}>{fmt(v.precio_venta)}</td>
                      <td>{capitalize(v.metodo_pago)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Paginacion pagina={pagina} total={totalPags} onChange={setPagina} count={filtrados.length} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN ESTADÍSTICAS (solo admin)
// ─────────────────────────────────────────────────────────────────────────────
function SeccionEstadisticas() {
  const [vehiculos, setVehiculos] = useState([])
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([getVehiculos(), getVentas().catch(() => [])])
      .then(([v, vn]) => {
        setVehiculos(Array.isArray(v) ? v : v.vehiculos ?? v.data ?? [])
        setVentas(Array.isArray(vn) ? vn : vn.ventas ?? vn.data ?? [])
      }).finally(() => setCargando(false))
  }, [])

  if (cargando) return <CargandoTabla />

  const total = vehiculos.length
  const disponibles = vehiculos.filter(v => v.estado?.toLowerCase() === 'disponible').length
  const reservados  = vehiculos.filter(v => v.estado?.toLowerCase() === 'reservado').length
  const vendidos    = vehiculos.filter(v => v.estado?.toLowerCase() === 'vendido').length
  const ingresos    = ventas.reduce((acc, v) => acc + parseFloat(v.precio_venta || 0), 0)

  const porTipo = {}
  vehiculos.forEach(v => { const t = v.tipo ?? 'otro'; porTipo[t] = (porTipo[t] || 0) + 1 })

  const porMarca = {}
  vehiculos.forEach(v => { porMarca[v.marca] = (porMarca[v.marca] || 0) + 1 })
  const topMarcas = Object.entries(porMarca).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxMarca = Math.max(...topMarcas.map(([, n]) => n), 1)

  const statCards = [
    { label: 'Total vehículos', val: total,        color: '#6366f1' },
    { label: 'Disponibles',     val: disponibles,   color: '#22c55e' },
    { label: 'Reservados',      val: reservados,    color: '#f59e0b' },
    { label: 'Vendidos',        val: vendidos,      color: '#e63946' },
    { label: 'Ventas',          val: ventas.length, color: '#0ea5e9' },
    { label: 'Ingresos totales',val: fmt(ingresos), color: '#a855f7', big: true },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        {statCards.map(({ label, val, color, big }) => (
          <div key={label} className="stat-card" style={{ minWidth: big ? 200 : 130 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: big ? 22 : 32, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 20 }}>Estado del inventario</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 140, paddingBottom: 8 }}>
            {[{ label: 'Disponibles', n: disponibles, color: '#22c55e' }, { label: 'Reservados', n: reservados, color: '#f59e0b' }, { label: 'Vendidos', n: vendidos, color: '#e63946' }].map(({ label, n, color }) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color }}>{n}</span>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 100 }}>
                  <div style={{ width: '100%', height: `${total ? (n / total) * 100 : 0}%`, background: color, minHeight: n > 0 ? 4 : 0, borderRadius: '6px 6px 0 0', transition: 'height 0.6s ease' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>Top marcas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topMarcas.map(([marca, n]) => (
              <div key={marca} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, width: 90, color: 'var(--text)' }}>{marca}</span>
                <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(n / maxMarca) * 100}%`, background: G, borderRadius: 99, transition: 'width 0.7s ease' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: R, width: 24, textAlign: 'right' }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>Vehículos por tipo</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(porTipo).map(([tipo, n]) => (
              <div key={tipo} style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, color: R }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{tipo}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{total ? Math.round(n / total * 100) : 0}%</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>Exportar datos</h3>
          <ExportBtn data={vehiculos} nombre="vehiculos" label="Exportar vehículos (.csv)" full />
          <ExportBtn data={ventas} nombre="ventas" label="Exportar ventas (.csv)" full />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN CREAR EMPLEADO (solo admin)
// ─────────────────────────────────────────────────────────────────────────────
function SeccionCrearEmpleado() {
  const [form, setForm] = useState({
    nombre: '', apellido: '', documento: '', localidad: '',
    telefono: '', fecha_nacimiento: '', email: '', password: '', confirmar: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.nombre || !form.apellido || !form.documento || !form.email || !form.password) {
      setError('Completá todos los campos obligatorios.')
      return
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setGuardando(true)
    try {
      await crearEmpleado({
        nombre: form.nombre, apellido: form.apellido,
        documento: form.documento, localidad: form.localidad,
        telefono: form.telefono, fecha_nacimiento: form.fecha_nacimiento || null,
        email: form.email, password: form.password,
        rol: 'empleado',
      })
      setExito(true)
      setForm({ nombre: '', apellido: '', documento: '', localidad: '', telefono: '', fecha_nacimiento: '', email: '', password: '', confirmar: '' })
    } catch (e) {
      setError(e.response?.data?.error ?? 'Error al crear empleado.')
    }
    setGuardando(false)
  }

  const campo = (label, key, type = 'text', obligatorio = false) => (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
        {label}{obligatorio && <span style={{ color: R }}> *</span>}
      </label>
      <input
        className="modal-input"
        type={type}
        value={form[key]}
        onChange={e => { set(key, e.target.value); setExito(false); setError(null) }}
        style={{ width: '100%', boxSizing: 'border-box' }}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text)', margin: 0 }}>Nuevo empleado</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Creá una cuenta con rol empleado</p>
          </div>
        </div>

        {exito && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={16} color="#22c55e" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#22c55e' }}>¡Empleado creado correctamente!</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {campo('Nombre', 'nombre', 'text', true)}
          {campo('Apellido', 'apellido', 'text', true)}
          {campo('Documento', 'documento', 'text', true)}
          {campo('Teléfono', 'telefono')}
          {campo('Localidad', 'localidad')}
          {campo('Fecha de nacimiento', 'fecha_nacimiento', 'date')}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            {campo('Email', 'email', 'email', true)}
          </div>
          {campo('Contraseña', 'password', 'password', true)}
          {campo('Confirmar contraseña', 'confirmar', 'password', true)}
        </div>

        {error && (
          <div style={{ background: 'rgba(230,57,70,0.08)', border: '1.5px solid rgba(230,57,70,0.2)', borderRadius: 12, padding: '10px 14px', marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} color={R} />
            <span style={{ fontSize: 13, color: R }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="primary-btn" onClick={handleSubmit} disabled={guardando} style={{ minWidth: 160 }}>
            {guardando ? <><span className="spinner spin" /> Creando...</> : <><UserPlus size={15} /> Crear empleado</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────
function Paginacion({ pagina, total, onChange, count }) {
  if (total <= 1) return <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>{count} resultado{count !== 1 ? 's' : ''}</div>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
      <button className="page-btn" disabled={pagina === 1} onClick={() => onChange(pagina - 1)}><ChevronLeft size={14} /></button>
      {Array.from({ length: total }, (_, i) => i + 1)
        .filter(n => n === 1 || n === total || Math.abs(n - pagina) <= 1)
        .map((n, i, arr) => (
          <span key={n} style={{ display: 'contents' }}>
            {i > 0 && arr[i - 1] !== n - 1 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>…</span>}
            <button className={`page-btn ${n === pagina ? 'active' : ''}`} onClick={() => onChange(n)}>{n}</button>
          </span>
        ))}
      <button className="page-btn" disabled={pagina === total} onClick={() => onChange(pagina + 1)}><ChevronRight size={14} /></button>
      <span style={{ marginLeft: 6, fontSize: 13, color: 'var(--text-muted)' }}>{count} resultado{count !== 1 ? 's' : ''}</span>
    </div>
  )
}

function CargandoTabla() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 48, color: 'var(--text-muted)' }}>
      <div style={{ width: 20, height: 20, border: '2.5px solid var(--border)', borderTopColor: R, borderRadius: '50%' }} className="spin" />
      Cargando...
    </div>
  )
}

function ExportBtn({ data, nombre, label, full }) {
  const exportar = () => {
    const arr = Array.isArray(data) ? data : []
    if (!arr.length) return
    const cols = Object.keys(arr[0])
    const csv = [
      cols.join(','),
      ...arr.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${nombre}.csv`; a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button
      className="btn-icon"
      onClick={exportar}
      style={full
        ? { width: '100%', padding: '11px 16px', fontSize: 13, fontWeight: 700, justifyContent: 'center', gap: 8, borderRadius: 12, color: 'var(--text)' }
        : { padding: '7px 12px', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text)' }
      }
    >
      <Download size={14} /> {label ?? 'Exportar CSV'}
    </button>
  )
}