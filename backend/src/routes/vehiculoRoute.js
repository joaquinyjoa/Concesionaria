const express = require("express");
const router = express.Router();
const controladorVehiculo = require('../controllers/vehiculoController');

// Rutas para vehículos
router.get('/', controladorVehiculo.getVehiculos);
router.get('/:id', controladorVehiculo.getVehiculoById);
router.post('/', controladorVehiculo.createVehiculo);
router.put('/:id', controladorVehiculo.updateVehiculo);
router.delete('/:id', controladorVehiculo.deleteVehiculo);

module.exports = router;