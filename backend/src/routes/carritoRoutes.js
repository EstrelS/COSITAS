const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const carritoController = require('../controllers/carritoController');

router.post('/', verifyToken, carritoController.agregarAlCarrito);
router.get('/', verifyToken, carritoController.obtenerCarrito);
router.delete('/:id_producto', verifyToken, carritoController.eliminarDelCarrito);

module.exports = router;