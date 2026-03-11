const pool = require('../config/database');

exports.create = async (data) => {
    const { vehiculo_id, cliente_id, empleado_id, precio_venta, metodo_pago } = data;

    const query = `INSERT INTO ventas 
        (vehiculo_id, cliente_id, empleado_id, fecha_venta, precio_venta, metodo_pago)
        VALUES ($1, $2, $3, NOW(), $4, $5)
        RETURNING *`;

    const params = [vehiculo_id, cliente_id, empleado_id, precio_venta, metodo_pago];
    const result = await pool.query(query, params);
    return result.rows[0];
}

exports.getAll = async () => {
    const query = `SELECT v.*, 
        ve.marca, ve.modelo,
        c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
        e.nombre AS empleado_nombre, e.apellido AS empleado_apellido
        FROM ventas v
        JOIN vehiculos ve ON v.vehiculo_id = ve.id
        JOIN clientes c ON v.cliente_id = c.id
        JOIN empleados e ON v.empleado_id = e.id`;

    const result = await pool.query(query);
    return result.rows;
}

exports.getById = async (id) => {
    const query = `SELECT v.*, 
        ve.marca, ve.modelo,
        c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
        e.nombre AS empleado_nombre, e.apellido AS empleado_apellido
        FROM ventas v
        JOIN vehiculos ve ON v.vehiculo_id = ve.id
        JOIN clientes c ON v.cliente_id = c.id
        JOIN empleados e ON v.empleado_id = e.id
        WHERE v.id = $1`;

    const result = await pool.query(query, [id]);
    return result.rows[0];
}

exports.getAllByEmpleado = async (empleado_id) => {
    const query = `SELECT v.*, 
        ve.marca, ve.modelo,
        c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
        e.nombre AS empleado_nombre, e.apellido AS empleado_apellido
        FROM ventas v
        JOIN vehiculos ve ON v.vehiculo_id = ve.id
        JOIN clientes c ON v.cliente_id = c.id
        JOIN empleados e ON v.empleado_id = e.id
        WHERE v.empleado_id = $1
        ORDER BY v.fecha_venta DESC`;

    const result = await pool.query(query, [empleado_id]);
    return result.rows;
}

exports.getAllByCliente = async (cliente_id) => {
    const query = `SELECT v.*, 
        ve.marca, ve.modelo, ve.tipo, ve.anio,
        e.nombre AS empleado_nombre, e.apellido AS empleado_apellido
        FROM ventas v
        JOIN vehiculos ve ON v.vehiculo_id = ve.id
        JOIN empleados e ON v.empleado_id = e.id
        WHERE v.cliente_id = $1
        ORDER BY v.fecha_venta DESC`;
    const result = await pool.query(query, [cliente_id]);
    return result.rows;
}

