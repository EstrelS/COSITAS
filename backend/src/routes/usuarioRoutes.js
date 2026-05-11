const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Obtener perfil del usuario
router.get('/perfil', verifyToken, async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        const [usuarios] = await connection.query(
        'SELECT id_usuario, nombre, email, tipo_usuario, calificacion_promedio, verificado, foto_perfil_url FROM usuarios WHERE id_usuario = ?',
        [id_usuario]
        );
        
        connection.release();
        
        if (usuarios.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        res.json({ success: true, usuario: usuarios[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Actualizar perfil
router.put('/perfil', verifyToken, async (req, res) => {
    try {
        const { nombre, foto_perfil_url } = req.body;
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        await connection.query(
        'UPDATE usuarios SET nombre = ?, foto_perfil_url = ? WHERE id_usuario = ?',
        [nombre, foto_perfil_url, id_usuario]
        );
        
        connection.release();
        res.json({ success: true, message: 'Perfil actualizado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Cambiar contraseña
router.post('/cambiar-password', verifyToken, async (req, res) => {
    try {
        const { password_antigua, password_nueva } = req.body;
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        const [usuarios] = await connection.query(
        'SELECT password_hash FROM usuarios WHERE id_usuario = ?',
        [id_usuario]
        );
        
        if (usuarios.length === 0 || !(await bcrypt.compare(password_antigua, usuarios[0].password_hash))) {
        connection.release();
        return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
        }
        
        const password_hash = await bcrypt.hash(password_nueva, 10);
        await connection.query(
        'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?',
        [password_hash, id_usuario]
        );
        
        connection.release();
        res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Obtener usuario público
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        const [usuarios] = await connection.query(
        'SELECT id_usuario, nombre, calificacion_promedio, verificado, foto_perfil_url FROM usuarios WHERE id_usuario = ? AND eliminado = FALSE',
        [id]
        );
        
        connection.release();
        
        if (usuarios.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        res.json({ success: true, usuario: usuarios[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
