const pool = require('../config/database');

const agregarAlCarrito = async (req, res) => {
    let connection;
    try {
        const { id_producto, cantidad, id_usuario } = req.body;
        connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = cantidad + ?',
            [id_usuario, id_producto, cantidad, cantidad]
        );
        res.status(201).json({ success: true, message: 'Producto añadido' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const obtenerCarrito = async (req, res) => {
    let connection;
    try {
        const { id_usuario } = req.query;
        connection = await pool.getConnection();
        const [carrito] = await connection.query(
            'SELECT c.id_producto, c.cantidad, p.titulo AS nombre, p.precio, p.fotos AS foto FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_usuario = ?',
            [id_usuario]
        );
        res.json({ success: true, carrito });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const eliminarDelCarrito = async (req, res) => {
    let connection;
    try {
        const { id_usuario, id_producto } = req.query;
        connection = await pool.getConnection();
        await connection.query('DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?', [id_usuario, id_producto]);
        res.json({ success: true, message: 'Eliminado del carrito' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { agregarAlCarrito, obtenerCarrito, eliminarDelCarrito };