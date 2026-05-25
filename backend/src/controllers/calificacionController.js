const pool = require('../config/database');
const Joi = require('joi');

const calificacionSchema = Joi.object({
    id_transaccion: Joi.number().integer().required(),
    calificacion: Joi.number().integer().min(1).max(5).required(),
    comentario: Joi.string().allow('').max(1000)
});

const crearCalificacion = async (req, res) => {
    let connection;
    try {
        const { error, value } = calificacionSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { id_transaccion, calificacion, comentario } = value;
        const id_usuario = req.user.id_usuario;
        connection = await pool.getConnection();

        // Verificar transacción pertenece al usuario y obtener el vendedor
        const [trans] = await connection.query('SELECT id_comprador, id_vendedor FROM transacciones WHERE id_transacciones = ?', [id_transaccion]);
        if (trans.length === 0 || trans[0].id_comprador !== id_usuario) {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const [result] = await connection.query(
            'INSERT INTO calificaciones (id_calificador, id_calificado, id_transaccion, puntiacion, omentario) VALUES (?, ?, ?, ?, ?)',
            [id_usuario, trans[0].id_vendedor, id_transaccion, calificacion, comentario]
        );


        res.status(201).json({
        success: true,
        message: 'Calificación creada',
        id_calificacion: result.insertId
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Ya has calificado esta compra anteriormente.' });
        }
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const obtenerCalificacionesProducto = async (req, res) => {
    let connection;
    try {
        const { id_producto } = req.params;
        connection = await pool.getConnection();

        const [calificaciones] = await connection.query(`
        SELECT c.id_calificacion, c.puntiacion AS calificacion, c.omentario AS comentario, u.nombre, u.foto_perfil_url
        FROM calificaciones c
        JOIN transacciones t ON c.id_transaccion = t.id_transacciones
        JOIN usuarios u ON c.id_calificador = u.id_usuario
        WHERE t.id_producto = ?
        ORDER BY c.id_calificacion DESC
        `, [id_producto]);


        res.json({ success: true, calificaciones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const obtenerCalificacionesUsuario = async (req, res) => {
    let connection;
    try {
        const { id_usuario } = req.params;
        connection = await pool.getConnection();

        const [calificaciones] = await connection.query(`
        SELECT c.id_calificacion, c.puntiacion AS calificacion, c.omentario AS comentario, 
               p.id_producto, p.titulo AS nombre_producto, p.fotos
        FROM calificaciones c
        JOIN transacciones t ON c.id_transaccion = t.id_transacciones
        JOIN productos p ON t.id_producto = p.id_producto
        WHERE c.id_calificador = ?
        ORDER BY c.id_calificacion DESC
        `, [id_usuario]);

        res.json({ success: true, calificaciones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    crearCalificacion,
    obtenerCalificacionesProducto,
    obtenerCalificacionesUsuario
};
