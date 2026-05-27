const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const productoController = require('../controllers/productoController');

// 1. Dashboard - Estadísticas
router.get('/dashboard/stats', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [usuarios] = await connection.query('SELECT COUNT(*) as total FROM usuarios WHERE eliminado = 0');
        const [productos] = await connection.query('SELECT COUNT(*) as total FROM productos WHERE eliminado = 0');
        const [transacciones] = await connection.query('SELECT COUNT(*) as total FROM transacciones');
        
        // CORREGIDO: Se usan comillas simples para el valor del string 'pendiente'
        const [reportes] = await connection.query("SELECT COUNT(*) as total FROM reportes WHERE estado = 'pendiente'");        
        
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
        console.error('Error en admin/dashboard/stats:', err);
        res.status(500).json({ success: false, message: 'Error al cargar estadísticas' });
    }
});

// 2. Rutas administrativas de Productos
router.patch('/productos/:id/suspender', verifyToken, verifyRole('administrador'), productoController.pausarProducto);
router.patch('/productos/:id/reactivar', verifyToken, verifyRole('administrador'), productoController.reactivarProducto);
router.patch('/productos/:id/editar', verifyToken, verifyRole('administrador'), productoController.actualizarProducto);

router.get('/productos/gestion', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [productos] = await connection.query('SELECT * FROM productos');
        connection.release();
        res.json({ success: true, productos });
    } catch (err) {
        console.error('Error en admin/productos/gestion:', err);
        res.status(500).json({ success: false, message: 'Error al cargar gestión de productos' });
    }
});

// 3. Verificar artesano
router.patch('/artesanos/:id/verificar', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        await connection.query('UPDATE perfil_artesano SET verificado_artesano = TRUE WHERE id_artesano = ?', [id]);
        connection.release();
        res.json({ success: true, message: 'Artesano verificado' });
    } catch (err) {
        console.error('Error al verificar artesano:', err);
        res.status(500).json({ success: false, message: 'Error al verificar artesano' });
    }
});

// 4. Suspender usuario
router.patch('/usuarios/:id/suspender', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        await connection.query('UPDATE usuarios SET eliminado = TRUE WHERE id_usuario = ?', [id]);
        connection.release();
        res.json({ success: true, message: 'Usuario suspendido' });
    } catch (err) {
        console.error('Error al suspender usuario:', err);
        res.status(500).json({ success: false, message: 'Error al suspender usuario' });
    }
});

// 5. Resolver reporte
router.patch('/reportes/:id/resolver', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const connection = await pool.getConnection();
        
        await connection.query('UPDATE reportes SET estado = ? WHERE id_reporte = ?', [estado, id]);
        
        connection.release();
        res.json({ success: true, message: 'Reporte actualizado' });
    } catch (err) {
        console.error('Error al resolver reporte:', err);
        res.status(500).json({ success: false, message: 'Error al resolver reporte' });
    }
});

module.exports = router;