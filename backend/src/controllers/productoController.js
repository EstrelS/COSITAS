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

// Crear producto
const crearProducto = async (req, res) => {
    try {
        const { error, value } = productoSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { nombre, precio, cantidad_disponible, descripcion, id_categoria, fotos } = value;
        const id_vendedor = req.user.id_usuario;

        const connection = await pool.getConnection();
        const [result] = await connection.query(
        'INSERT INTO productos (id_vendedor, nombre, precio, cantidad_disponible, descripcion, id_categoria, fotos) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_vendedor, nombre, precio, cantidad_disponible, descripcion, id_categoria, JSON.stringify(fotos || [])]
        );

        connection.release();

        res.status(201).json({
        success: true,
        message: 'Producto creado',
        id_producto: result.insertId
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Obtener productos
const obtenerProductos = async (req, res) => {
    try {
        const { categoria, busqueda, vendedor } = req.query;
        const connection = await pool.getConnection();

        let query = 'SELECT * FROM productos WHERE eliminado = FALSE AND estado_producto = "activo"';
        const params = [];

        if (categoria) {
        query += ' AND id_categoria = ?';
        params.push(categoria);
        }

        if (busqueda) {
        query += ' AND nombre LIKE ?';
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

// Obtener producto por ID
const obtenerProductoId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [productos] = await connection.query(
        'SELECT * FROM productos WHERE id_producto = ? AND eliminado = FALSE',
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

// Actualizar producto
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = productoSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const connection = await pool.getConnection();

        // Verificar propiedad
        const [productos] = await connection.query('SELECT id_vendedor FROM productos WHERE id_producto = ?', [id]);
        if (productos.length === 0 || productos[0].id_vendedor !== req.user.id_usuario) {
        connection.release();
        return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const { nombre, precio, cantidad_disponible, descripcion, id_categoria, fotos } = value;

        await connection.query(
        'UPDATE productos SET nombre = ?, precio = ?, cantidad_disponible = ?, descripcion = ?, id_categoria = ?, fotos = ? WHERE id_producto = ?',
        [nombre, precio, cantidad_disponible, descripcion, id_categoria, JSON.stringify(fotos || []), id]
        );

        connection.release();

        res.json({ success: true, message: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Eliminar (borrado lógico) producto
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [productos] = await connection.query('SELECT id_vendedor FROM productos WHERE id_producto = ?', [id]);
        if (productos.length === 0 || productos[0].id_vendedor !== req.user.id_usuario) {
        connection.release();
        return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        await connection.query('UPDATE productos SET eliminado = TRUE WHERE id_producto = ?', [id]);
        connection.release();

        res.json({ success: true, message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Pausar producto
const pausarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [productos] = await connection.query('SELECT id_vendedor FROM productos WHERE id_producto = ?', [id]);
        if (productos.length === 0 || productos[0].id_vendedor !== req.user.id_usuario) {
        connection.release();
        return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        await connection.query('UPDATE productos SET estado_producto = "pausado" WHERE id_producto = ?', [id]);
        connection.release();

        res.json({ success: true, message: 'Producto pausado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoId,
    actualizarProducto,
    eliminarProducto,
    pausarProducto
};
