const pool = require('../config/database');
const Joi = require('joi');

const reporteSchema = Joi.object({
    id_producto: Joi.number().integer().required(),
    motivo_reporte: Joi.string().required(),
    descripcion: Joi.string().required()
});

const crearReporte = async (req, res) => {
    try {
        const { error, value } = reporteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        }

        const { id_producto, motivo_reporte, descripcion } = value;
        const id_usuario_reporta = req.user.id_usuario; // Obtenemos el usuario autenticado

        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            'INSERT INTO reportes (id_producto, id_usuario_reporta, motivo_reporte, descripcion) VALUES (?, ?, ?, ?)',
            [id_producto, id_usuario_reporta, motivo_reporte, descripcion]
        );

        connection.release();
        res.status(201).json({ success: true, message: 'Reporte creado exitosamente' });
    } catch (err) {
        console.error('Error al crear reporte:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const obtenerReportes = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        // Traemos solo los pendientes y le adjuntamos el nombre del producto
        const [reportes] = await connection.query(
            'SELECT r.*, p.titulo AS nombre_producto FROM reportes r JOIN productos p ON r.id_producto = p.id_producto WHERE r.estado = "pendiente" ORDER BY r.fecha_reporte DESC'
        );
        connection.release();
        res.json({ success: true, reportes });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al cargar reportes' });
    }
};

const resolverReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Puede ser 'resuelto' o 'desestimado'
        const connection = await pool.getConnection();
        await connection.query('UPDATE reportes SET estado = ? WHERE id_reporte = ?', [estado, id]);
        connection.release();
        res.json({ success: true, message: 'Reporte actualizado' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al resolver reporte' });
    }
};

module.exports = { crearReporte, obtenerReportes, resolverReporte };