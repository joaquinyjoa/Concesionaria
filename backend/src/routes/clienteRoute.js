const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/buscar', auth, clienteController.buscar);
router.get('/me', auth, clienteController.getMe);       
router.get('/:id', auth, clienteController.getById);
router.get('/', auth, isAdmin, clienteController.getAll);
router.put('/:id', auth, clienteController.update);
router.delete('/:id', auth, clienteController.delete);

module.exports = router;