const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/register', usuarioController.register);
router.post('/login', usuarioController.login);

module.exports = router;