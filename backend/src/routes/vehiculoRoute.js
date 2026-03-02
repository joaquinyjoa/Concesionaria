const express = require("express");
const router = express.Router();
const controladorVehiculo = require('../controller/vehiculoController');

// Rutas para vehículos
router.post('/', controladorVehiculo.crearVehiculo);

module.exports = router;