const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const Joi = require('joi');

const perfilSchema = Joi.object({
    especialidad: Joi.string(),
    descripcion: Joi.string(),
    años_experiencia: Joi.number().integer().min(0),
    redes_sociales: Joi.object()
});

// Obtener perfil del artesano
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        const [artesanos] = await connection.query(
        'SELECT pa.*, u.nombre, u.calificacion_promedio, u.foto_perfil_url, u.verificado FROM perfil_artesano pa JOIN usuarios u ON pa.id_usuario = u.id_usuario WHERE pa.id_artesano = ? AND pa.eliminado = FALSE',
        [id]
        );
        
        connection.release();
        
        if (artesanos.length === 0) {
        return res.status(404).json({ success: false, message: 'Artesano no encontrado' });
        }
        
        res.json({ success: true, artesano: artesanos[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Actualizar perfil artesano
router.put('/perfil', verifyToken, verifyRole('artesano'), async (req, res) => {
    try {
        const { error, value } = perfilSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        
        const id_usuario = req.user.id_usuario;
        const { especialidad, descripcion, años_experiencia, redes_sociales } = value;
        const connection = await pool.getConnection();
        
        await connection.query(
        'UPDATE perfil_artesano SET especialidad = ?, descripcion = ?, años_experiencia = ?, redes_sociales = ? WHERE id_usuario = ?',
        [especialidad, descripcion, años_experiencia, JSON.stringify(redes_sociales || {}), id_usuario]
        );
        
        connection.release();
        res.json({ success: true, message: 'Perfil actualizado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Obtener todos los artesanos
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [artesanos] = await connection.query(
        'SELECT pa.*, u.nombre, u.calificacion_promedio, u.foto_perfil_url FROM perfil_artesano pa JOIN usuarios u ON pa.id_usuario = u.id_usuario WHERE pa.eliminado = FALSE AND pa.verificado = TRUE'
        );
        
        connection.release();
        res.json({ success: true, artesanos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
