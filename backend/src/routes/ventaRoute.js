const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const auth = require('../middlewares/auth');
const isEmpleado = require('../middlewares/isEmpleado');

router.post('/', auth, isEmpleado, ventaController.create);
router.get('/cliente/:cliente_id', auth, ventaController.getAllByCliente); 
router.get('/', auth, isEmpleado, ventaController.getAll);
router.get('/:id', auth, isEmpleado, ventaController.getById);

module.exports = router;