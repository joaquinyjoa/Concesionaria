import { BrowserRouter, Routes, Route } from 'react-router-dom'

// pages
import Home from './pages/Home'
import DetalleVehiculo from './pages/DetalleVehiculo'
import Login from './pages/Login'
import Register from './pages/Register'
import Perfil from './pages/Perfil'
import Admin from './pages/Admin'
import Verificar from './pages/Verificar'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehiculos/:id" element={<DetalleVehiculo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/verificar" element={<Verificar />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App