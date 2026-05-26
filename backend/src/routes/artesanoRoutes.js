const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const Joi = require('joi');

const perfilSchema = Joi.object({
    especialidad: Joi.string().allow('', null),
    descripcion: Joi.string().allow('', null),
    años_experiencia: Joi.number().integer().min(0).allow('', null),
    redes_sociales: Joi.object(),
    foto_perfil_url: Joi.string().allow('', null)
});

// Obtener perfil del artesano
// Obtener perfil del artesano
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        // ¡Cambiamos "artesano" por 'artesano' con comillas simples!
        const [artesanos] = await connection.query(
        "SELECT u.id_usuario, u.nombre, u.calificacion_promedio, u.foto_perfil_url, u.verificado, pa.especialidad, pa.decripcion_taller AS descripcion, pa.años_experiencia, pa.redes_sociales_json AS redes_sociales FROM usuarios u LEFT JOIN perfil_artesano pa ON u.id_usuario = pa.id_usuario WHERE u.id_usuario = ? AND (u.eliminado = FALSE OR u.eliminado IS NULL) AND u.tipo_usuario = 'artesano'",
        [id]
        );
        
        connection.release();
        
        if (artesanos.length === 0) {
            return res.status(404).json({ success: false, message: 'Artesano no encontrado' });
        }
        
        res.json({ success: true, artesano: artesanos[0] });
    } catch (err) {
        // Agregamos este console.error para que NUNCA más un error sea invisible en Render
        console.error("Error al obtener artesano:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Actualizar perfil artesano
router.put('/perfil', verifyToken, verifyRole('artesano'), async (req, res) => {
    try {
        const { error, value } = perfilSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        
        const id_usuario = req.user.id_usuario;
        
        // Asignamos valores por defecto en caso de que vengan vacíos
        const especialidad = value.especialidad || '';
        const descripcion = value.descripcion || '';
        const años_experiencia = value.años_experiencia || 0;
        const redes_sociales = value.redes_sociales || {};
        const connection = await pool.getConnection();
        
        await connection.query(
        'INSERT INTO perfil_artesano (id_usuario, especialidad, decripcion_taller, años_experiencia, redes_sociales_json) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE especialidad = ?, decripcion_taller = ?, años_experiencia = ?, redes_sociales_json = ?',
        [id_usuario, especialidad, descripcion, años_experiencia, JSON.stringify(redes_sociales), especialidad, descripcion, años_experiencia, JSON.stringify(redes_sociales)]
        );
        
        // Si se envía una foto de perfil, actualizamos la tabla de usuarios
        if (value.foto_perfil_url !== undefined) {
            await connection.query('UPDATE usuarios SET foto_perfil_url = ? WHERE id_usuario = ?', [value.foto_perfil_url, id_usuario]);
        }

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
        'SELECT pa.*, pa.decripcion_taller AS descripcion, pa.redes_sociales_json AS redes_sociales, u.nombre, u.calificacion_promedio, u.foto_perfil_url FROM perfil_artesano pa JOIN usuarios u ON pa.id_usuario = u.id_usuario WHERE (pa.eliminado = FALSE OR pa.eliminado IS NULL) AND pa.verificado = TRUE'
        );
        
        connection.release();
        res.json({ success: true, artesanos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
