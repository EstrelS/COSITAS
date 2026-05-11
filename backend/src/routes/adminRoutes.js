const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Dashboard - Estadísticas
router.get('/dashboard/stats', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [usuarios] = await connection.query('SELECT COUNT(*) as total FROM usuarios WHERE eliminado = FALSE');
        const [productos] = await connection.query('SELECT COUNT(*) as total FROM productos WHERE eliminado = FALSE');
        const [transacciones] = await connection.query('SELECT COUNT(*) as total FROM transacciones WHERE eliminado = FALSE');
        const [reportes] = await connection.query('SELECT COUNT(*) as total FROM reportes WHERE estado = "pendiente"');
        
        connection.release();
        
        res.json({ 
        success: true, 
        stats: {
            usuarios: usuarios[0].total,
            productos: productos[0].total,
            transacciones: transacciones[0].total,
            reportes_pendientes: reportes[0].total
        }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Verificar artesano
router.patch('/artesanos/:id/verificar', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        await connection.query('UPDATE perfil_artesano SET verificado = TRUE WHERE id_artesano = ?', [id]);
        connection.release();
        
        res.json({ success: true, message: 'Artesano verificado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Suspender usuario
router.patch('/usuarios/:id/suspender', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        await connection.query('UPDATE usuarios SET eliminado = TRUE WHERE id_usuario = ?', [id]);
        connection.release();
        
        res.json({ success: true, message: 'Usuario suspendido' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Resolver reporte
router.patch('/reportes/:id/resolver', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const connection = await pool.getConnection();
        
        await connection.query('UPDATE reportes SET estado = ? WHERE id_reporte = ?', [estado, id]);
        connection.release();
        
        res.json({ success: true, message: 'Reporte actualizado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
