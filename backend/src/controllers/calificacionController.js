const pool = require('../config/database');
const Joi = require('joi');

const calificacionSchema = Joi.object({
    id_transaccion: Joi.number().integer().required(),
    puntuacion: Joi.number().integer().min(1).max(5).required(),
    comentario: Joi.string().max(1000)
});

const crearCalificacion = async (req, res) => {
    try {
        const { error, value } = calificacionSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { id_transaccion, puntuacion, comentario } = value;
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();

        // Verificar transacción pertenece al usuario
        const [trans] = await connection.query('SELECT id_comprador FROM transacciones WHERE id_transaccion = ?', [id_transaccion]);
        if (trans.length === 0 || trans[0].id_comprador !== id_usuario) {
        connection.release();
        return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const [result] = await connection.query(
        'INSERT INTO calificaciones (id_usuario, id_transaccion, puntuacion, comentario) VALUES (?, ?, ?, ?)',
        [id_usuario, id_transaccion, puntuacion, comentario]
        );

        connection.release();

        res.status(201).json({
        success: true,
        message: 'Calificación creada',
        id_calificacion: result.insertId
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    };

    const obtenerCalificacionesProducto = async (req, res) => {
    try {
        const { id_producto } = req.params;
        const connection = await pool.getConnection();

        const [calificaciones] = await connection.query(`
        SELECT c.*, u.nombre, u.foto_perfil_url
        FROM calificaciones c
        JOIN transacciones t ON c.id_transaccion = t.id_transaccion
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE t.id_producto = ? AND c.eliminado = FALSE
        `, [id_producto]);

        connection.release();

        res.json({ success: true, calificaciones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    crearCalificacion,
    obtenerCalificacionesProducto
};
