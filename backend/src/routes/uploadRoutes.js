const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { subirImagenes } = require('../controllers/uploadController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Subir múltiples imágenes (campo 'fotos')
router.post('/', verifyToken, verifyRole('artesano', 'administrador'), upload.array('fotos', 10), subirImagenes);

module.exports = router;
