const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

// Buscar productos
router.get('/', async (req, res) => {
    try {
        const { q, categoria, precio_min, precio_max } = req.query;
        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM productos WHERE eliminado = FALSE AND estado_producto = "activo"';
        const params = [];
        
        if (q) {
        query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
        params.push(`%${q}%`, `%${q}%`);
        }
        
        if (categoria) {
        query += ' AND id_categoria = ?';
        params.push(categoria);
        }
        
        if (precio_min) {
        query += ' AND precio >= ?';
        params.push(precio_min);
        }
        
        if (precio_max) {
        query += ' AND precio <= ?';
        params.push(precio_max);
        }
        
        const [productos] = await connection.query(query, params);
        
        // Registrar búsqueda si usuario autenticado
        if (req.headers.authorization && q) {
        const token = req.headers['authorization'].split(' ')[1];
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            await connection.query(
            'INSERT INTO busqueda_historial (id_usuario, query_busqueda) VALUES (?, ?)',
            [decoded.id_usuario, q]
            );
        } catch (e) {}
        }
        
        connection.release();
        res.json({ success: true, productos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Obtener historial de búsquedas
router.get('/historial', verifyToken, async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();
        
        const [historial] = await connection.query(
        'SELECT DISTINCT query_busqueda, MAX(fecha) as fecha FROM busqueda_historial WHERE id_usuario = ? GROUP BY query_busqueda ORDER BY fecha DESC LIMIT 10',
        [id_usuario]
        );
        
        connection.release();
        res.json({ success: true, historial });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
