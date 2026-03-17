function errorHandler(err, req, res, next) {
    
    // 404 - No encontrado
    const erroresNotFound = [
        'Vehículo no encontrado',
        'Cliente no encontrado',
        'Empleado no encontrado',
        'Usuario no encontrado',
        'Venta no encontrada',
        'Imagen no encontrada' 
    ];
    if (erroresNotFound.includes(err.message)) {
        return res.status(404).json({ error: err.message });
    }

    // 400 - Errores de validación
    const erroresValidacion = [
        'Falta el campo',
        'debe ser',
        'no puede',
        'no es válido',
        'debe tener',
        'mayor a 0',
        'es demasiado corto',
        'No se envió ninguna imagen',        
        'Solo se permiten imágenes',         
        'no puede tener más de 3 imágenes',  
        'debe estar reservado',
        'No se puede eliminar un vehículo que tiene ventas registradas'
    ];
    if (erroresValidacion.some(e => err.message.includes(e))) {
        return res.status(400).json({ error: err.message });
    }

    // 400 - Email ya registrado
    if (err.message === 'El email ya está registrado') {
        return res.status(400).json({ error: err.message });
    }

     // 400 - Documento duplicado
    if (err.code === '23505') {
        return res.status(400).json({ error: 'El documento ya está registrado' });
    }

    // 401 - Credenciales incorrectas
    if (err.message === 'Email o contraseña incorrectos') {
        return res.status(401).json({ error: err.message });
    }
    
    // 403 - Sin permisos
    if (err.message.includes('No tenés permisos')) {
        return res.status(403).json({ error: err.message });
    }   

    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;