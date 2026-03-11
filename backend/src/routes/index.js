const express = require('express');
const router = express.Router();
const vehiculosRoute = require('./vehiculoRoute');
const imagenRoute =  require('./imagenRoute');
const usuarioRoute = require('./usuarioRoute');
const clientesRoute =  require('./clienteRoute');
const empleadosRoute =  require('./empleadoRoute');
const ventasRoute = require('./ventaRoute');
const notificacionRoute = require('./notificacionRoute');

router.use('/vehiculos', vehiculosRoute);
router.use('/vehiculos/:vehiculo_id/imagenes', imagenRoute);
router.use('/imagenes', imagenRoute);
router.use('/auth', usuarioRoute);
router.use('/clientes', clientesRoute);
router.use('/empleados', empleadosRoute);
router.use('/ventas', ventasRoute);
router.use('/notificaciones', notificacionRoute);

module.exports = router;