const pool = require('../config/database');
const Joi = require('joi');

const mensajeSchema = Joi.object({
    id_conversacion: Joi.number().integer().required(),
    contenido: Joi.string().required()
});

const enviarMensaje = async (req, res) => {
    try {
        const { error, value } = mensajeSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { id_conversacion, contenido } = value;
        const id_emisor = req.user.id_usuario;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
        'INSERT INTO mensajes_chat (id_conversacion, id_emisor, contenido) VALUES (?, ?, ?)',
        [id_conversacion, id_emisor, contenido]
        );

        // Actualizar fecha de conversación
        await connection.query(
        'UPDATE conversaciones SET fecha_ultima_actualizacion = CURRENT_TIMESTAMP WHERE id_conversacion = ?',
        [id_conversacion]
        );

        connection.release();

        res.status(201).json({ success: true, id_mensaje: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const obtenerMensajes = async (req, res) => {
    try {
        const { id_conversacion } = req.params;
        const connection = await pool.getConnection();

        const [mensajes] = await connection.query(
        'SELECT * FROM mensajes_chat WHERE id_conversacion = ? AND eliminado = FALSE ORDER BY timestamp ASC',
        [id_conversacion]
        );

        connection.release();

        res.json({ success: true, mensajes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    enviarMensaje,
    obtenerMensajes
};
