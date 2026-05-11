const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    crearConversacion,
    obtenerConversaciones
} = require('../controllers/conversacionController');

router.post('/', verifyToken, crearConversacion);
router.get('/', verifyToken, obtenerConversaciones);

module.exports = router;
