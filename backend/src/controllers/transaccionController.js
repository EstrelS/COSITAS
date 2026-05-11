const pool = require('../config/database');
const Joi = require('joi');

const compraSchema = Joi.object({
    id_producto: Joi.number().integer().required(),
    cantidad: Joi.number().integer().min(1).required()
});

// Crear transacción (compra)
const crearTransaccion = async (req, res) => {
    try {
        const { error, value } = compraSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { id_producto, cantidad } = value;
        const id_comprador = req.user.id_usuario;
        const connection = await pool.getConnection();

        // Obtener producto
        const [productos] = await connection.query('SELECT * FROM productos WHERE id_producto = ? AND eliminado = FALSE', [id_producto]);
        if (productos.length === 0 || productos[0].cantidad_disponible < cantidad) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Producto no disponible' });
        }

        const producto = productos[0];
        const monto_total = producto.precio * cantidad;

        // Crear transacción
        const [result] = await connection.query(
        'INSERT INTO transacciones (id_producto, id_comprador, cantidad, precio_unitario, monto_total) VALUES (?, ?, ?, ?, ?)',
        [id_producto, id_comprador, cantidad, producto.precio, monto_total]
        );

        // Actualizar stock
        await connection.query(
        'UPDATE productos SET cantidad_disponible = cantidad_disponible - ? WHERE id_producto = ?',
        [cantidad, id_producto]
        );

        connection.release();

        res.status(201).json({
        success: true,
        message: 'Transacción creada',
        id_transaccion: result.insertId
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Obtener transacciones del usuario
const obtenerTransacciones = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const connection = await pool.getConnection();

        const [transacciones] = await connection.query(
        'SELECT t.*, p.nombre, p.fotos FROM transacciones t JOIN productos p ON t.id_producto = p.id_producto WHERE t.id_comprador = ? AND t.eliminado = FALSE ORDER BY t.fecha_transaccion DESC',
        [id_usuario]
        );

        connection.release();

        res.json({ success: true, transacciones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Actualizar estado de transacción
const actualizarEstadoTransaccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_transaccion } = req.body;

        if (!['pendiente', 'completada', 'cancelada', 'devuelta'].includes(estado_transaccion)) {
        return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const connection = await pool.getConnection();

        // Verificar permisos (solo admin o dueño)
        const [transacciones] = await connection.query('SELECT id_comprador FROM transacciones WHERE id_transaccion = ?', [id]);
        if (transacciones.length === 0 || (transacciones[0].id_comprador !== req.user.id_usuario && req.user.tipo_usuario !== 'administrador')) {
        connection.release();
        return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        await connection.query('UPDATE transacciones SET estado_transaccion = ? WHERE id_transaccion = ?', [estado_transaccion, id]);
        connection.release();

        res.json({ success: true, message: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    crearTransaccion,
    obtenerTransacciones,
    actualizarEstadoTransaccion
};
