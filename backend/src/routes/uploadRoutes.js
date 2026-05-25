const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { subirImagenes } = require('../controllers/uploadController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Subir múltiples imágenes (se permite a cualquier usuario para su foto de perfil)
router.post('/', verifyToken, upload.array('fotos', 10), subirImagenes);

module.exports = router;
