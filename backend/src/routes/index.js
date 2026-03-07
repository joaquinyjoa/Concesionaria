const express = require('express');
const router = express.Router();

router.use('/vehiculos', require('./vehiculoRoute'));
router.use('/auth', require('./usuarioRoute'));
router.use('/clientes', require('./clienteRoute'));
router.use('/empleados', require('./empleadoRoute'));

module.exports = router;