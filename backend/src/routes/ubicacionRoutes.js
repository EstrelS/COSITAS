const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');
const Joi = require('joi');

const ubicacionSchema = Joi.object({
    latitud: Joi.number().required(),
    longitud: Joi.number().required(),
    ciudad: Joi.string().required(),
    direccion_completa: Joi.string().required()
});

// Crear/Actualizar ubicación
router.post('/', verifyToken, async (req, res) => {
    try {
        const { error, value } = ubicacionSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        
        const { latitud, longitud, ciudad, direccion_completa } = value;
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        // Verificar si existe
        const [existente] = await connection.query(
        'SELECT id_ubicacion FROM ubicaciones WHERE id_usuario = ? AND eliminado = FALSE',
        [id_usuario]
        );
        
        if (existente.length > 0) {
        await connection.query(
            'UPDATE ubicaciones SET latitud = ?, longitud = ?, ciudad = ?, direccion_completa = ? WHERE id_usuario = ?',
            [latitud, longitud, ciudad, direccion_completa, id_usuario]
        );
        } else {
        await connection.query(
            'INSERT INTO ubicaciones (id_usuario, latitud, longitud, ciudad, direccion_completa) VALUES (?, ?, ?, ?, ?)',
            [id_usuario, latitud, longitud, ciudad, direccion_completa]
        );
        }
        
        connection.release();
        res.json({ success: true, message: 'Ubicación actualizada' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Obtener ubicación del usuario
router.get('/', verifyToken, async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        const [ubicaciones] = await connection.query(
        'SELECT * FROM ubicaciones WHERE id_usuario = ? AND eliminado = FALSE',
        [id_usuario]
        );
        
        connection.release();
        res.json({ success: true, ubicacion: ubicaciones[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
