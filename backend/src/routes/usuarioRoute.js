const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// rutas públicas
router.post('/register', usuarioController.register);
router.post('/login', usuarioController.login);

// rutas protegidas solo para admin
router.post('/crear-empleado', auth, isAdmin, usuarioController.crearEmpleado);

router.get('/verificar', usuarioController.verificarCuenta);
router.post('/solicitar-reset', usuarioController.solicitarReset);
router.post('/reset-password', usuarioController.resetPassword);
router.put('/cambiar-password', auth, usuarioController.cambiarPassword);

module.exports = router;