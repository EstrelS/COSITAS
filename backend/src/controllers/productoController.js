const pool = require('../config/database');
const Joi = require('joi');

const productoSchema = Joi.object({
    titulo: Joi.string().required(),
    precio: Joi.number().positive().required(),
    cantidad_disponible: Joi.number().integer().min(0).required(),
    descripcion: Joi.string().allow(''),
    id_categoria: Joi.number().integer().required(),
    fotos: Joi.array().items(Joi.string())
});

const crearProducto = async (req, res) => {
    try {
        const { error, value } = productoSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        const { titulo, precio, cantidad_disponible, descripcion, id_categoria, fotos } = value;
        const id_vendedor = req.user.id_usuario;
        const connection = await pool.getConnection();
        const [result] = await connection.query(
        'INSERT INTO productos (id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria, fotos) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria, JSON.stringify(fotos || [])]
        );
        connection.release();
        res.status(201).json({ success: true, message: 'Producto creado', id_producto: result.insertId });
    } catch (err) {
        console.error("Error en crearProducto:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const obtenerProductos = async (req, res) => {
    try {
        const { categoria, busqueda, vendedor } = req.query;
        const connection = await pool.getConnection();
        let query = 'SELECT * FROM productos WHERE estado_producto = "activo"';
        const params = [];
        if (categoria) { query += ' AND id_categoria = ?'; params.push(categoria); }
        if (busqueda) { query += ' AND titulo LIKE ?'; params.push(`%${busqueda}%`); }
        if (vendedor) { query += ' AND id_vendedor = ?'; params.push(vendedor); }
        const [productos] = await connection.query(query, params);
        connection.release();
        res.json({ success: true, productos });
    } catch (err) { 
        console.error("Error en obtenerProductos:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
};

const obtenerProductoId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [productos] = await connection.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
        connection.release();
        if (productos.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, producto: productos[0] });
    } catch (err) { 
        console.error("Error en obtenerProductoId:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, precio, descripcion } = req.body;
        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE productos SET titulo = ?, precio = ?, descripcion = ? WHERE id_producto = ?',
            [titulo, precio, descripcion, id]
        );
        connection.release();
        res.json({ success: true, message: 'Producto actualizado exitosamente' });
    } catch (err) { 
        console.error("Error en actualizarProducto:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
};

const pausarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        await connection.query('UPDATE productos SET estado_producto = "suspendido" WHERE id_producto = ?', [id]);
        connection.release();
        res.json({ success: true, message: 'Producto dado de baja correctamente' });
    } catch (err) { 
        console.error("Error en pausarProducto:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
};

// --- FUNCIÓN DE REACTIVACIÓN CORREGIDA ---
// Esta función ahora es directa y no valida otros campos para evitar errores con Joi
const reactivarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            'UPDATE productos SET estado_producto = "activo" WHERE id_producto = ?', 
            [id]
        );
        
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        res.json({ success: true, message: 'Producto reactivado correctamente' });
    } catch (err) { 
        console.error("ERROR CRÍTICO AL REACTIVAR:", err);
        res.status(500).json({ success: false, message: 'Error en el servidor: ' + err.message }); 
    }
};

const eliminarProducto = async (req, res) => {
    res.status(403).json({ success: false, message: 'Operación no permitida por seguridad' });
};

module.exports = {
    crearProducto, 
    obtenerProductos, 
    obtenerProductoId, 
    actualizarProducto, 
    eliminarProducto, 
    pausarProducto, 
    reactivarProducto
};