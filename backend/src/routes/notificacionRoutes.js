const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

// Obtener notificaciones del usuario
router.get('/', verifyToken, async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        const [notificaciones] = await connection.query(
        'SELECT * FROM notificaciones WHERE id_usuario = ? AND eliminado = FALSE ORDER BY fecha_notificacion DESC',
        [id_usuario]
        );
        
        connection.release();
        res.json({ success: true, notificaciones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Marcar como leída
router.patch('/:id/leer', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        await connection.query(
        'UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ?',
        [id]
        );
        
        connection.release();
        res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
