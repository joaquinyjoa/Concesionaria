const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/:id', auth, clienteController.getById);
router.put('/:id', auth, clienteController.update);
router.delete('/:id', auth, isAdmin, clienteController.delete);

module.exports = router;