const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    crearCalificacion,
    obtenerCalificacionesProducto,
    obtenerCalificacionesUsuario
} = require('../controllers/calificacionController');

router.post('/', verifyToken, crearCalificacion);
router.get('/producto/:id_producto', obtenerCalificacionesProducto);
router.get('/usuario/:id_usuario', obtenerCalificacionesUsuario);

module.exports = router;
