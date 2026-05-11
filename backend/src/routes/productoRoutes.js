const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    crearProducto,
    obtenerProductos,
    obtenerProductoId,
    actualizarProducto,
    eliminarProducto,
    pausarProducto
} = require('../controllers/productoController');

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoId);
router.post('/', verifyToken, verifyRole('artesano'), crearProducto);
router.put('/:id', verifyToken, verifyRole('artesano'), actualizarProducto);
router.delete('/:id', verifyToken, verifyRole('artesano'), eliminarProducto);
router.patch('/:id/pausar', verifyToken, verifyRole('artesano'), pausarProducto);

module.exports = router;
