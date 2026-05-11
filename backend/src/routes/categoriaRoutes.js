const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [categorias] = await connection.query(
        'SELECT * FROM categorias WHERE eliminado = FALSE ORDER BY nombre_categoria ASC'
        );
        connection.release();
        res.json({ success: true, categorias });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Crear categoría (solo admin)
router.post('/', verifyToken, verifyRole('administrador'), async (req, res) => {
    try {
        const { nombre_categoria, id_categoria_padre } = req.body;
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
        'INSERT INTO categorias (nombre_categoria, id_categoria_padre) VALUES (?, ?)',
        [nombre_categoria, id_categoria_padre]
        );
        
        connection.release();
        res.status(201).json({ success: true, id_categoria: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
