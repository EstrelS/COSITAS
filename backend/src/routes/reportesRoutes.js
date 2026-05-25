const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const { crearReporte, obtenerReportes } = require('../controllers/reporteController');

// 1. Ruta para que cualquier usuario guarde un reporte
router.post('/', verifyToken, crearReporte);

// 2. Ruta para que el panel de administración lea la lista de reportes pendientes
router.get('/', verifyToken, verifyRole('administrador'), obtenerReportes);

module.exports = router;