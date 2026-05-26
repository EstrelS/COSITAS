const pool = require('../config/database');

const crearConversacion = async (req, res) => {
    let connection;
    try {
        const { id_usuario_2 } = req.body;
        const id_usuario_1 = req.user.id_usuario;
        connection = await pool.getConnection();

        // Verificar si conversación ya existe
        const [existente] = await connection.query(
        'SELECT id_conversacion FROM conversaciones WHERE (id_usuario_1 = ? AND id_usuario_2 = ?) OR (id_usuario_1 = ? AND id_usuario_2 = ?)',
        [id_usuario_1, id_usuario_2, id_usuario_2, id_usuario_1]
        );

        if (existente.length > 0) {
        return res.json({ success: true, id_conversacion: existente[0].id_conversacion });
        }

        const [result] = await connection.query(
        'INSERT INTO conversaciones (id_usuario_1, id_usuario_2) VALUES (?, ?)',
        [id_usuario_1, id_usuario_2]
        );

        res.status(201).json({ success: true, id_conversacion: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const obtenerConversaciones = async (req, res) => { 
    let connection;
    try {
        if (!req.user || !req.user.id_usuario) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }
        
        const id_usuario = req.user.id_usuario;
        connection = await pool.getConnection();

        const [conversaciones] = await connection.query(
        'SELECT * FROM conversaciones WHERE (id_usuario_1 = ? OR id_usuario_2 = ?) ORDER BY fecha_ultima_actualizacion DESC',
        [id_usuario, id_usuario]
        );


        res.json({ success: true, conversaciones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    crearConversacion,
    obtenerConversaciones
    };
