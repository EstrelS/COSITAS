const express = require('express');
const router = express.Router();

// Importamos la nueva función obtenerUsuarios que agregamos al controlador
const { registro, login, obtenerUsuarios } = require('../controllers/authController');

router.post('/registro', registro);
router.post('/login', login);

// NUEVA RUTA: La puerta para consultar todos los usuarios
router.get('/usuarios', obtenerUsuarios);

module.exports = router;