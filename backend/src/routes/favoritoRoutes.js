const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    agregarFavorito,
    obtenerFavoritos,
    eliminarFavorito
} = require('../controllers/favoritoController');

router.post('/', verifyToken, agregarFavorito);
router.get('/', verifyToken, obtenerFavoritos);
router.delete('/:id_producto', verifyToken, eliminarFavorito);

module.exports = router;
