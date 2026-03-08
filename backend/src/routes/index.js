const express = require('express');
const router = express.Router();

router.use('/vehiculos', require('./vehiculoRoute'));
router.use('/vehiculos/:vehiculo_id/imagenes', require('./imagenRoute'));
router.use('/auth', require('./usuarioRoute'));
router.use('/clientes', require('./clienteRoute'));
router.use('/empleados', require('./empleadoRoute'));
router.use('/ventas', require('./ventaRoute'));

module.exports = router;