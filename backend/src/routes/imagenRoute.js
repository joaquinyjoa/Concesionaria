const express = require('express');
const router = express.Router({ mergeParams: true });
const imagenController = require('../controllers/imagenController');
const auth = require('../middlewares/auth');
const isEmpleado = require('../middlewares/isEmpleado');
const upload = require('../config/multer');

router.get('/', imagenController.getByVehiculoId);
router.post('/', auth, isEmpleado, upload.single('imagen'), imagenController.create);
router.delete('/:id', auth, isEmpleado, imagenController.delete);

module.exports = router;