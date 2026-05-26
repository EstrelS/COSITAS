const pool = require('../config/database');

const agregarAlCarrito = async (req, res) => {
    let connection;
    try {
        const { id_producto, cantidad } = req.body;
        const id_usuario = req.user.id_usuario;
        connection = await pool.getConnection();
        
        try {
            await connection.query(
                'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = cantidad + ?',
                [id_usuario, id_producto, cantidad, cantidad]
            );
        } catch (dbErr) {
            try {
                // Respaldo por si la columna en la BD de tu amigo se llama id_comprador
                await connection.query(
                    'INSERT INTO carrito (id_comprador, id_producto, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = cantidad + ?',
                    [id_usuario, id_producto, cantidad, cantidad]
                );
            } catch (dbErr2) {
                throw new Error("Problema con la tabla carrito: " + dbErr2.message);
            }
        }
        await connection.query(
            'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = cantidad + ?',
            [id_usuario, id_producto, cantidad, cantidad]
        );
        res.status(201).json({ success: true, message: 'Producto agregado al carrito' });
    } catch (err) {
        console.error('❌ Error en agregarAlCarrito:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const obtenerCarrito = async (req, res) => {
    let connection;
    try {
        const id_usuario = req.user.id_usuario;
        connection = await pool.getConnection();
        
        let carrito = [];
        try {
            const [result] = await connection.query(
                'SELECT c.id_producto, c.cantidad, p.titulo AS nombre, p.precio, p.fotos AS foto FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_usuario = ?',
                [id_usuario]
            );
            carrito = result;
        } catch (dbErr) {
            try {
                const [result2] = await connection.query(
                    'SELECT c.id_producto, c.cantidad, p.titulo AS nombre, p.precio, p.fotos AS foto FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_comprador = ?',
                    [id_usuario]
                );
                carrito = result2;
            } catch (dbErr2) {
                console.log('⚠️ Error en tabla carrito (ignorando para no romper la página):', dbErr2.message);
            }
        }
        const [carrito] = await connection.query(
            'SELECT c.id_producto, c.cantidad, p.titulo AS nombre, p.precio, p.fotos AS foto FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_usuario = ?',
            [id_usuario]
        );
        res.json({ success: true, carrito });
    } catch (err) {
        console.error('❌ Error en obtenerCarrito:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const eliminarDelCarrito = async (req, res) => {
    let connection;
    try {
        const { id_producto } = req.params;
        const id_usuario = req.user.id_usuario;
        connection = await pool.getConnection();
        
        try {
            await connection.query('DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?', [id_usuario, id_producto]);
        } catch (dbErr) {
            try {
                await connection.query('DELETE FROM carrito WHERE id_comprador = ? AND id_producto = ?', [id_usuario, id_producto]);
            } catch (dbErr2) {
                throw new Error("Problema con la tabla carrito: " + dbErr2.message);
            }
        }
        await connection.query('DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?', [id_usuario, id_producto]);
        res.json({ success: true, message: 'Eliminado del carrito' });
    } catch (err) {
        console.error('❌ Error en eliminarDelCarrito:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { agregarAlCarrito, obtenerCarrito, eliminarDelCarrito };