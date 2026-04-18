const pool = require('./database');

const queryCrearTablaVehiculo = `
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    motor VARCHAR(100),
    anio INTEGER,
    kilometraje INTEGER,
    condicion VARCHAR(50),
    estado VARCHAR(50),
    descripcion TEXT,
    precio NUMERIC,
    reservado_por INTEGER
);
`;

const queryCrearTablaUsuarios = `
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol VARCHAR(50) NOT NULL,
    verificado BOOLEAN DEFAULT false,
    reset_token TEXT,
    reset_token_expira TIMESTAMP
);
`;

const queryCrearTablaClientes = `
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    localidad VARCHAR(100),
    telefono VARCHAR(50),
    fecha_nacimiento DATE,
    FOREIGN KEY (id) REFERENCES usuarios(id) ON DELETE CASCADE
);
`;

const queryCrearTablaEmpleados = `
CREATE TABLE IF NOT EXISTS empleados (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    localidad VARCHAR(100),
    telefono VARCHAR(50),
    fecha_nacimiento DATE,
    FOREIGN KEY (id) REFERENCES usuarios(id) ON DELETE CASCADE
);
`;

const queryCrearTablaImagenes = `
CREATE TABLE IF NOT EXISTS imagenes (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);
`;

const queryCrearTablaVentas = `
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    empleado_id INTEGER NOT NULL,
    fecha_venta TIMESTAMP NOT NULL,
    precio_venta NUMERIC NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);
`;

const queryCrearTablaNotificaciones = `
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    mensaje TEXT,
    vehiculo_id INTEGER REFERENCES vehiculos(id),
    cliente_id INTEGER REFERENCES clientes(id),
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Migraciones para bases de datos ya existentes
const migraciones = [
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token TEXT`,
    `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token_expira TIMESTAMP`,
    `ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS reservado_por INTEGER`,
];

(async () => {
    const client = await pool.connect();
    try {
        await client.query(queryCrearTablaVehiculo);
        await client.query(queryCrearTablaUsuarios);
        await client.query(queryCrearTablaClientes);
        await client.query(queryCrearTablaEmpleados);
        await client.query(queryCrearTablaImagenes);
        await client.query(queryCrearTablaVentas);
        await client.query(queryCrearTablaNotificaciones);

        for (const sql of migraciones) {
            await client.query(sql);
        }

        console.log("Base de datos inicializada correctamente 🚀");
    } catch (error) {
        console.error(error);
    } finally {
        client.release();
    }
})();