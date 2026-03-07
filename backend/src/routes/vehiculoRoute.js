const express = require("express");
const router = express.Router();
const controladorVehiculo = require('../controllers/vehiculoController');
const auth = require('../middlewares/auth');
const isEmpleado = require('../middlewares/isEmpleado');
const isAdmin = require('../middlewares/isAdmin');

// Rutas para vehículos
router.get('/', controladorVehiculo.getVehiculos);                            // pública
router.get('/:id', controladorVehiculo.getVehiculoById);                      // pública
router.post('/', auth, isEmpleado, controladorVehiculo.createVehiculo);       // empleado/admin
router.put('/:id', auth, isEmpleado, controladorVehiculo.updateVehiculo);     // empleado/admin
router.delete('/:id', auth, isAdmin, controladorVehiculo.deleteVehiculo);     // solo admin

module.exports = router;