const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const auth = require('../middlewares/auth');

router.get('/:id', auth, clienteController.getById);
router.put('/:id', auth, clienteController.update);
router.delete('/:id', auth, clienteController.delete);

module.exports = router;