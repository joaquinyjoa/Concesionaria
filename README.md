# 🚗 Auto Care — Sistema de Gestión de Concesionaria

Aplicación web full-stack para la gestión de una concesionaria de vehículos. Permite a los clientes explorar el catálogo y reservar vehículos, mientras que los empleados y administradores gestionan el inventario, ventas y notificaciones desde un panel de control.

🔗 **Demo en producción:** [concesionaria-lovat.vercel.app](https://concesionaria-lovat.vercel.app)

---

## ✨ Funcionalidades

### Clientes

- Registro y login con JWT
- Explorar catálogo de vehículos con filtros
- Reservar vehículos disponibles
- Ver historial de compras y descargar ticket PDF
- Cambiar contraseña y editar datos de perfil
- Recuperación de contraseña por email

### Empleados

- Panel de gestión de vehículos (crear, editar, eliminar)
- Subida de imágenes a Cloudinary
- Registrar ventas asociando cliente y método de pago
- Generación automática de ticket PDF al vender
- Ver notificaciones en tiempo real cuando un cliente reserva
- Ver sus propias ventas

### Administrador

- Todo lo de empleados +
- Ver y gestionar clientes y empleados
- Estadísticas del inventario y ventas
- Exportar datos a CSV
- Crear nuevos empleados desde el panel

---

## 🛠 Tecnologías

### Backend

| Tecnología                | Uso                                   |
| ------------------------- | ------------------------------------- |
| Node.js + Express         | Servidor y API REST                   |
| PostgreSQL                | Base de datos relacional              |
| JWT                       | Autenticación                         |
| bcrypt                    | Hash de contraseñas                   |
| Cloudinary                | Almacenamiento de imágenes            |
| Resend                    | Envío de emails (reset de contraseña) |
| multer-storage-cloudinary | Upload de imágenes                    |

### Frontend

| Tecnología   | Uso                       |
| ------------ | ------------------------- |
| React + Vite | UI y bundling             |
| React Router | Navegación SPA            |
| Axios        | Peticiones HTTP           |
| Tailwind CSS | Estilos                   |
| Lucide React | Íconos                    |
| Canvas API   | Generación de tickets PDF |

---

## 🚀 Instalación local

### Requisitos

- Node.js 18+
- PostgreSQL
- Cuenta en Cloudinary (gratis)
- Cuenta en Resend (gratis)

### 1. Clonar el repositorio

```bash
git clone https://github.com/joaquinyjoa/Concesionaria.git
cd Concesionaria
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crear el archivo `.env` en `/backend`:

```env
DB_USER=tu_usuario
DB_HOST=localhost
DB_NAME=concesionaria
DB_PASSWORD=tu_password
DB_PORT=5432
JWT_SECRET=tu_jwt_secret
PORT=3000
RESEND_API_KEY=re_xxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Crear la base de datos en PostgreSQL y ejecutar el schema:

```bash
psql -U tu_usuario -d concesionaria -f render_schema.sql
```

Iniciar el servidor:

```bash
npm run dev
```

### 3. Configurar el frontend

```bash
cd frontend
npm install
```

Crear el archivo `.env` en `/frontend`:

```env
VITE_API_URL=http://localhost:3000/concesionaria
```

Iniciar el frontend:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 🔐 Variables de entorno

### Backend (`/backend/.env`)

| Variable                | Descripción                             |
| ----------------------- | --------------------------------------- |
| `DATABASE_URL`          | URL de conexión PostgreSQL (producción) |
| `DB_USER`               | Usuario de PostgreSQL (local)           |
| `DB_HOST`               | Host de PostgreSQL (local)              |
| `DB_NAME`               | Nombre de la base de datos (local)      |
| `DB_PASSWORD`           | Contraseña de PostgreSQL (local)        |
| `DB_PORT`               | Puerto de PostgreSQL (local)            |
| `JWT_SECRET`            | Clave secreta para firmar tokens JWT    |
| `PORT`                  | Puerto del servidor (default: 3000)     |
| `RESEND_API_KEY`        | API Key de Resend para envío de emails  |
| `FRONTEND_URL`          | URL del frontend (para links en emails) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary          |
| `CLOUDINARY_API_KEY`    | API Key de Cloudinary                   |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary                |

### Frontend (`/frontend/.env`)

| Variable       | Descripción                |
| -------------- | -------------------------- |
| `VITE_API_URL` | URL base de la API backend |

---

## ☁️ Deploy en producción

### Backend → Render

1. Crear un nuevo **Web Service** en [render.com](https://render.com)
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Agregar todas las variables de entorno del backend en la sección **Environment**
5. Crear una base de datos **PostgreSQL** en Render y copiar el `DATABASE_URL` generado

### Frontend → Vercel

1. Importar el proyecto en [vercel.com](https://vercel.com)
2. Configurar:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
3. Agregar la variable de entorno:
   ```
   VITE_API_URL=https://tu-backend.onrender.com/concesionaria
   ```
4. Asegurarse de que el archivo `frontend/vercel.json` tenga el rewrite para SPA:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

> ⚠️ El plan gratuito de Render duerme el servidor tras 15 minutos de inactividad. El primer request puede tardar ~30 segundos.

---

## 📁 Estructura del proyecto

```
Concesionaria/
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/          # database, cloudinary, multer
│       ├── controllers/
│       ├── middlewares/     # auth, isAdmin, isEmpleado, errorHandler
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── utils/
└── frontend/
    ├── public/
    └── src/
        ├── api/             # axios, auth, vehiculos, clientes, etc.
        ├── components/      # ToggleTema
        ├── context/         # AuthContext, ThemeContext
        └── pages/           # Home, Login, Register, Admin, Perfil, etc.
```

---

## 👤 Autor

**Joaquin** — [github.com/joaquinyjoa](https://github.com/joaquinyjoa) — joaquinalfredogreco@gmail.com
