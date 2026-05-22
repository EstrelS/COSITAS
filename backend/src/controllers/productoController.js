const pool = require('../config/database');
const Joi = require('joi');

const productoSchema = Joi.object({
    nombre: Joi.string().required(),
    precio: Joi.number().positive().required(),
    cantidad_disponible: Joi.number().integer().min(0).required(),
    descripcion: Joi.string(),
    id_categoria: Joi.number().integer().required(),
    fotos: Joi.array().items(Joi.string())
});

const crearProducto = async (req, res) => {
    try {
        const { error, value } = productoSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        const { nombre, precio, cantidad_disponible, descripcion, id_categoria, fotos } = value;
        const id_vendedor = req.user.id_usuario;
        const connection = await pool.getConnection();
        const [result] = await connection.query(
        'INSERT INTO productos (id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria, fotos) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_vendedor, nombre, precio, cantidad_disponible, descripcion, id_categoria, JSON.stringify(fotos || [])]
        );
        connection.release();
        res.status(201).json({ success: true, message: 'Producto creado', id_producto: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// AQUI ESTÁ LA MAGIA: Adaptado a las columnas de Migue
const obtenerProductos = async (req, res) => {
    try {
        const { categoria, busqueda, vendedor } = req.query;
        const connection = await pool.getConnection();

        let query = 'SELECT * FROM productos WHERE estado_producto = "activo"';
        const params = [];

        if (categoria) {
            query += ' AND id_categoria = ?';
            params.push(categoria);
        }
        if (busqueda) {
            query += ' AND titulo LIKE ?'; // Cambiado de nombre a titulo
            params.push(`%${busqueda}%`);
        }
        if (vendedor) {
            query += ' AND id_vendedor = ?';
            params.push(vendedor);
        }

        const [productos] = await connection.query(query, params);
        connection.release();

        res.json({ success: true, productos });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// AQUI TAMBIEN: Adaptado al ID de Migue (YA EN SINGULAR)
const obtenerProductoId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [productos] = await connection.query(
            'SELECT * FROM productos WHERE id_producto = ?', // <-- AQUI ESTA EL CAMBIO A SINGULAR
            [id]
        );
        connection.release();

        if (productos.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, producto: productos[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        res.json({ success: true, message: 'Actualización en pausa hasta tener la base completa' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        res.json({ success: true, message: 'Eliminación en pausa' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const pausarProducto = async (req, res) => {
    try {
        res.json({ success: true, message: 'Pausa de producto desactivada' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    crearProducto, obtenerProductos, obtenerProductoId, actualizarProducto, eliminarProducto, pausarProducto
};