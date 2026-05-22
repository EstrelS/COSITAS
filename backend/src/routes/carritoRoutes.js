const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.post('/', carritoController.agregarAlCarrito);
router.get('/', carritoController.obtenerCarrito);
router.delete('/', carritoController.eliminarDelCarrito);

module.exports = router;