const pool = require('../config/database');

const crearConversacion = async (req, res) => {
    try {
        const { id_usuario_2, id_producto_relacionado } = req.body;
        const id_usuario_1 = req.user.id_usuario;
        const connection = await pool.getConnection();

        // Verificar si conversación ya existe
        const [existente] = await connection.query(
        'SELECT id_conversacion FROM conversaciones WHERE (id_usuario_1 = ? AND id_usuario_2 = ?) OR (id_usuario_1 = ? AND id_usuario_2 = ?) AND eliminado = FALSE',
        [id_usuario_1, id_usuario_2, id_usuario_2, id_usuario_1]
        );

        if (existente.length > 0) {
        connection.release();
        return res.json({ success: true, id_conversacion: existente[0].id_conversacion });
        }

        const [result] = await connection.query(
        'INSERT INTO conversaciones (id_usuario_1, id_usuario_2, id_producto_relacionado) VALUES (?, ?, ?)',
        [id_usuario_1, id_usuario_2, id_producto_relacionado]
        );

        connection.release();

        res.status(201).json({ success: true, id_conversacion: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const obtenerConversaciones = async (req, res) => { 
    try {
        if (!req.user || !req.user.id_usuario) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }
        

        const [conversaciones] = await connection.query(
        'SELECT * FROM conversaciones WHERE (id_usuario_1 = ? OR id_usuario_2 = ?) AND eliminado = FALSE ORDER BY fecha_ultima_actualizacion DESC',
        [id_usuario, id_usuario]
        );

        connection.release();

        res.json({ success: true, conversaciones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    crearConversacion,
    obtenerConversaciones
    };
