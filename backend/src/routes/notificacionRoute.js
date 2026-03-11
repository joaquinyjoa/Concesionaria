const express = require('express');
const router  = express.Router();
const notificacionController = require('../controllers/notificacionController');
const auth       = require('../middlewares/auth');
const isEmpleado = require('../middlewares/isEmpleado');

router.get('/',              auth, isEmpleado, notificacionController.getNoLeidas);
router.put('/:id/leer',      auth, isEmpleado, notificacionController.marcarLeida);
router.put('/leer-todas',    auth, isEmpleado, notificacionController.marcarTodasLeidas);

module.exports = router;