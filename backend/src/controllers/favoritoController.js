const pool = require('../config/database');

const agregarFavorito = async (req, res) => {
    try {
        const { id_producto } = req.body;
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
        'INSERT INTO favoritos (id_usuario, id_producto) VALUES (?, ?) ON DUPLICATE KEY UPDATE id_usuario = id_usuario',
        [id_usuario, id_producto]
        );

        connection.release();

        res.status(201).json({ success: true, message: 'Producto agregado a favoritos' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const obtenerFavoritos = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();

        const [favoritos] = await connection.query(
        'SELECT p.* FROM favoritos f JOIN productos p ON f.id_producto = p.id_producto WHERE f.id_usuario = ? AND p.eliminado = FALSE',
        [id_usuario]
        );

        connection.release();

        res.json({ success: true, favoritos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const eliminarFavorito = async (req, res) => {
    try {
        const { id_producto } = req.params;
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();

        await connection.query('DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?', [id_usuario, id_producto]);
        connection.release();

        res.json({ success: true, message: 'Favorito eliminado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    agregarFavorito,
    obtenerFavoritos,
    eliminarFavorito
};
