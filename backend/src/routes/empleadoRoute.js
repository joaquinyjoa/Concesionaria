const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const auth = require('../middlewares/auth');
const isEmpleado = require('../middlewares/isEmpleado');
const isAdmin = require('../middlewares/isAdmin');

router.get('/:id', auth, empleadoController.getById);
router.put('/:id', auth, isEmpleado, empleadoController.update);
router.delete('/:id', auth, isAdmin, empleadoController.delete);

module.exports = router;