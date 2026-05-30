const pool = require('../config/database');
const Joi = require('joi');

const reporteSchema = Joi.object({
    id_producto: Joi.number().integer().required(),
    motivo_reporte: Joi.string().required(),
    descripcion: Joi.string().required()
});

const crearReporte = async (req, res) => {
    let connection;
    try {
        const { error, value } = reporteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        }

        const { id_producto, motivo_reporte, descripcion } = value;
        const id_usuario_reporta = req.user.id_usuario; 

        connection = await pool.getConnection();
        
        // 🛡️ BLINDADO: Insertamos 'pendiente' explícitamente con comillas simples.
        // Esto evita que MySQL use su valor DEFAULT de la tabla si fue creado con comillas dobles.
        const [result] = await connection.query(
            "INSERT INTO reportes (id_producto, id_usuario_reporta, motivo_reporte, descripcion, estado) VALUES (?, ?, ?, ?, 'pendiente')",
            [id_producto, id_usuario_reporta, motivo_reporte, descripcion]
        );

        res.status(201).json({ success: true, message: 'Reporte creado exitosamente' });
    } catch (err) {
        console.error('Error al crear reporte:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor: ' + err.message });
    } finally {
        if (connection) connection.release();
    }
};

const obtenerReportes = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // Correcto: Comillas simples en 'pendiente' evitan errores de sintaxis ANSI_QUOTES
        const [reportes] = await connection.query(
            "SELECT r.*, p.titulo AS nombre_producto FROM reportes r JOIN productos p ON r.id_producto = p.id_producto WHERE r.estado = 'pendiente' ORDER BY r.fecha_reporte DESC"
        );
        res.json({ success: true, reportes });
    } catch (err) {
        console.error('Error al obtener reportes:', err);
        res.status(500).json({ success: false, message: 'Error al cargar reportes: ' + err.message });
    } finally {
        if (connection) connection.release();
    }
};

const resolverReporte = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        connection = await pool.getConnection();
        // Correcto: El marcador de posición (?) maneja de forma segura las comillas
        await connection.query('UPDATE reportes SET estado = ? WHERE id_reporte = ?', [estado, id]);
        res.json({ success: true, message: 'Reporte actualizado' });
    } catch (err) {
        console.error('Error al resolver reporte:', err);
        res.status(500).json({ success: false, message: 'Error al resolver reporte: ' + err.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { crearReporte, obtenerReportes, resolverReporte };