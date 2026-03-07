const express = require("express");
const router = express.Router();
const controladorVehiculo = require('../controllers/vehiculoController');

// Rutas para vehículos
router.post('/vehiculos', controladorVehiculo.createVehiculo);

module.exports = router;