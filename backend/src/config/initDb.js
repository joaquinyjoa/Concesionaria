const openDb = require('./database');

let queryCrearTablaVehiculo = 'CREATE TABLE IF NOT EXISTS vehiculos \
(id INTEGER PRIMARY KEY AUTOINCREMENT, \
tipo TEXT, \
marca TEXT, \
modelo TEXT, \
año INTEGER, \
kilometraje INTEGER, \
condicion TEXT, \
estado TEXT, \
precio REAL)';

let queryCrearTablaImagenes = 'CREATE TABLE IF NOT EXISTS imagenes \
(id INTEGER PRIMARY KEY AUTOINCREMENT, \
vehiculo_id INTEGER NOT NULL, \
url TEXT NOT NULL, \
FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)) \
ON DELETE CASCADE';

let queryCrearTablaUsuarios = 'CREATE TABLE IF NOT EXISTS usuarios \
(id INTEGER PRIMARY KEY AUTOINCREMENT, \
email TEXT NOT NULL UNIQUE, \
password TEXT NOT NULL, \
fecha_registro TEXT, \
rol TEXT NOT NULL)';

let queryCrearTablaCLientes = 'CREATE TABLE IF NOT EXISTS clientes \
(id INTEGER PRIMARY KEY AUTOINCREMENT, \
nombre TEXT NOT NULL, \
apellido TEXT NOT NULL, \
documento TEXT NOT NULL UNIQUE, \
telefono TEXT, \
FOREIGN KEY (id) REFERENCES usuarios(id)) \
ON DELETE CASCADE';

let queryCrearTablaEmpleados = 'CREATE TABLE IF NOT EXISTS empleados \
(id INTEGER PRIMARY KEY AUTOINCREMENT, \
nombre TEXT NOT NULL, \
apellido TEXT NOT NULL, \
documento TEXT NOT NULL UNIQUE, \
email TEXT NOT NULL UNIQUE, \
telefono TEXT, \
FOREIGN KEY (id) REFERENCES usuarios(id)) \
ON DELETE CASCADE';

let queryCrearTablaVentas = 'CREATE TABLE IF NOT EXISTS ventas \
(id INTEGER PRIMARY KEY AUTOINCREMENT, \
vehiculo_id INTEGER NOT NULL, \
cliente_id INTEGER NOT NULL, \
empleado_id INTEGER NOT NULL, \
fecha_venta TEXT NOT NULL, \
precio_venta REAL NOT NULL, \
metodo_pago TEXT NOT NULL, \
FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id), \
FOREIGN KEY (cliente_id) REFERENCES clientes(id), \
FOREIGN KEY (empleado_id) REFERENCES empleados(id)) \
ON DELETE CASCADE';

//inicializa la base de datos creando la tabla de usuarios si no existe
(async () => {
    const db = await openDb();

    //habilita las claves foraneas
    await db.exec("PRAGMA foreign_keys = ON");

    //crea la tabla de vehiculos si no existe
    await db.exec(queryCrearTablaVehiculo);

    //crea la tabla de imagenes si no existe
    await db.exec(queryCrearTablaImagenes);

    //crea la tabla de usuarios si no existe
    await db.exec(queryCrearTablaUsuarios);

    //crea la tabla de clientes si no existe
    await db.exec(queryCrearTablaCLientes);

    //crea la tabla de empleados si no existe
    await db.exec(queryCrearTablaEmpleados);

    //crea la tabla de ventas si no existe
    await db.exec(queryCrearTablaVentas);

    await db.close();
})();