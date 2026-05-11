const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const Joi = require('joi');

const reporteSchema = Joi.object({
    id_usuario_reportado: Joi.number().integer(),
    id_producto_reportado: Joi.number().integer(),
    motivo_reporte: Joi.string().required(),
    descripcion: Joi.string()
});

// Crear reporte
router.post('/', verifyToken, async (req, res) => {
    try {
        const { error, value } = reporteSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        
        const { id_usuario_reportado, id_producto_reportado, motivo_reporte, descripcion } = value;
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
        'INSERT INTO reportes (id_usuario, id_usuario_reportado, id_producto_reportado, motivo_reporte, descripcion) VALUES (?, ?, ?, ?, ?)',
        [id_usuario, id_usuario_reportado, id_producto_reportado, motivo_reporte, descripcion]
        );
        
        connection.release();
        res.status(201).json({ success: true, id_reporte: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Obtener reportes (solo admin)
router.get('/', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [reportes] = await connection.query(
        'SELECT * FROM reportes WHERE eliminado = FALSE ORDER BY fecha_reporte DESC'
        );
        connection.release();
        res.json({ success: true, reportes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
