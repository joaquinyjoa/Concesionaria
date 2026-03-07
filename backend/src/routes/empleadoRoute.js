const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/:id', auth, empleadoController.getById);
router.put('/:id', auth, empleadoController.update);
router.delete('/:id', auth, empleadoController.delete); // el service controla los permisos

module.exports = router;