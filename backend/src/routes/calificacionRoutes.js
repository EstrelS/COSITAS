const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    crearCalificacion,
    obtenerCalificacionesProducto
} = require('../controllers/calificacionController');

router.post('/', verifyToken, crearCalificacion);
router.get('/producto/:id_producto', obtenerCalificacionesProducto);

module.exports = router;
