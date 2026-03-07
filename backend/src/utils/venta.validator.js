function validarVenta(data) {
    const errores = [];

    const camposObligatorios = ['vehiculo_id', 'cliente_id', 'empleado_id', 'precio_venta', 'metodo_pago'];
    for (const campo of camposObligatorios) {
        if (!data[campo] || data[campo] === '') {
            errores.push(`Falta el campo ${campo}`);
        }
    }

    // precio_venta válido
    if (data.precio_venta) {
        const precio = Number(data.precio_venta);
        if (isNaN(precio) || precio <= 0) {
            errores.push('El precio de venta debe ser mayor a 0');
        }
        if (!/^\d+(\.\d{1,2})?$/.test(String(data.precio_venta))) {
            errores.push('El precio de venta debe tener máximo 2 decimales');
        }
    }

    // metodo_pago válido
    const metodosValidos = ['efectivo', 'transferencia', 'tarjeta'];
    if (data.metodo_pago && !metodosValidos.includes(data.metodo_pago.toLowerCase())) {
        errores.push('El método de pago debe ser: efectivo, transferencia o tarjeta');
    }

    return errores;
}

module.exports = { validarVenta };