const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    crearTransaccion,
    obtenerTransacciones,
    actualizarEstadoTransaccion
} = require('../controllers/transaccionController');

router.post('/', verifyToken, crearTransaccion);
router.get('/', verifyToken, obtenerTransacciones);
router.patch('/:id', verifyToken, actualizarEstadoTransaccion);

module.exports = router;
