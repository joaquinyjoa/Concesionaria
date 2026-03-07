const express = require('express');
const router = express.Router();

router.use('/vehiculos', require('./vehiculoRoute'));

// A futuro vas agregando así:
// router.use('/usuarios', require('./usuarioRoute'));
// router.use('/ventas', require('./ventaRoute'));

module.exports = router;