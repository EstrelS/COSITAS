const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    enviarMensaje,
    obtenerMensajes
} = require('../controllers/mensajeController');

router.post('/', verifyToken, enviarMensaje);
router.get('/:id_conversacion', verifyToken, obtenerMensajes);

module.exports = router;
