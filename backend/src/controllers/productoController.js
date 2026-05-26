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

// Lista de palabras prohibidas (contenido malo)
const palabrasProhibidas = [
    'fraude', 'estafa', 'engaño', 'robo', 'droga', 'arma', 'ilegal',
    'violencia', 'odio', 'discriminación', 'racismo', 'porno', 'obsceno'
];

// Función para validar que el precio sea en pesos (no dólares)
const validarPrecio = (precio, precioStr = '') => {
    // Si precio contiene símbolos de dólar o menciona USD
    const precioTexto = precioStr.toString().toUpperCase();
    if (precioTexto.includes('$') || precioTexto.includes('USD') || precioTexto.includes('DOLAR')) {
        return { valido: false, error: 'El precio debe estar en pesos COP, no en dólares' };
    }
    if (precio <= 0) {
        return { valido: false, error: 'El precio debe ser mayor a 0' };
    }
    return { valido: true };
};

// Función para validar contenido apropiado
const validarContenidoApropiado = (texto) => {
    const textoLower = texto.toLowerCase().trim();
    
    for (let palabra of palabrasProhibidas) {
        if (textoLower.includes(palabra)) {
            return { 
                valido: false, 
                error: `Contenido no permitido detectado: "${palabra}". Por favor revisa el contenido del producto` 
            };
        }
    }
    
    return { valido: true };
};

const crearProducto = async (req, res) => {
    let connection;
    try {
        const { error, value } = productoSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });
        const { titulo, precio, cantidad_disponible, descripcion, id_categoria, fotos } = value;
        
        // Validar precio (detectar dólares)
        const validacionPrecio = validarPrecio(precio);
        if (!validacionPrecio.valido) {
            return res.status(400).json({ 
                success: false, 
                errors: [validacionPrecio.error] 
            });
        }

        // Validar contenido apropiado en título
        const validacionTitulo = validarContenidoApropiado(titulo);
        if (!validacionTitulo.valido) {
            return res.status(400).json({ 
                success: false, 
                errors: [validacionTitulo.error] 
            });
        }

        // Validar contenido apropiado en descripción
        if (descripcion && descripcion.trim().length > 0) {
            const validacionDescripcion = validarContenidoApropiado(descripcion);
            if (!validacionDescripcion.valido) {
                return res.status(400).json({ 
                    success: false, 
                    errors: [validacionDescripcion.error] 
                });
            }
        }

        const id_vendedor = req.user.id_usuario;
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        let result;
        try {
            // Intento 1: Con decripcion y fotos
            [result] = await connection.query(
                'INSERT INTO productos (id_vendedor, titulo, precio, cantidad_disponible, decripcion, id_categoria, fotos, estado_producto) VALUES (?, ?, ?, ?, ?, ?, ?, "activo")',
                [id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria, JSON.stringify(fotos || [])]
            );
        } catch (e1) {
            try {
                // Intento 2: Con descripcion (bien escrito) y fotos
                [result] = await connection.query(
                    'INSERT INTO productos (id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria, fotos, estado_producto) VALUES (?, ?, ?, ?, ?, ?, ?, "activo")',
                    [id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria, JSON.stringify(fotos || [])]
                );
            } catch (e2) {
                try {
                    // Intento 3: Sin fotos y con decripcion
                    [result] = await connection.query(
                        'INSERT INTO productos (id_vendedor, titulo, precio, cantidad_disponible, decripcion, id_categoria, estado_producto) VALUES (?, ?, ?, ?, ?, ?, "activo")',
                        [id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria]
                    );
                } catch (e3) {
                    // Intento 4: Sin fotos y con descripcion
                    [result] = await connection.query(
                        'INSERT INTO productos (id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria, estado_producto) VALUES (?, ?, ?, ?, ?, ?, "activo")',
                        [id_vendedor, titulo, precio, cantidad_disponible, descripcion, id_categoria]
                    );
                }
            }
        }

        if (!result) {
            throw new Error("La tabla productos no coincide con ninguna de las estructuras esperadas.");
        }
        
        const id_producto = result.insertId;
        
        // Guardar cada foto en imagenes_producto (con orden)
        if (fotos && fotos.length > 0) {
            for (let i = 0; i < fotos.length; i++) {
                try {
                    await connection.query(
                        'INSERT INTO imagenes_producto (id_producto, url_imagen, orden) VALUES (?, ?, ?)',
                        [id_producto, fotos[i], i + 1]
                    );
                } catch (imgErr) {
                    console.log('⚠️ Aviso: La tabla imagenes_producto no existe o dio error:', imgErr.message);
                }
            }
        }
        
        await connection.commit();
        res.status(201).json({ success: true, message: 'Producto creado', id_producto });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Error en crearProducto:", err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const obtenerProductos = async (req, res) => {
    let connection;
    try {
        const { categoria, busqueda, vendedor, incluir_inactivos } = req.query;
        connection = await pool.getConnection();
        let estadoCondition = incluir_inactivos === 'true' ? '1=1' : "p.estado_producto = 'activo'";
        let query = `
            SELECT p.*, p.decripcion AS descripcion,
                   (SELECT COALESCE(AVG(c.puntiacion), 0) 
                    FROM calificaciones c 
                    JOIN transacciones t ON c.id_transaccion = t.id_transacciones 
                    WHERE t.id_producto = p.id_producto) AS calificacion_promedio
            FROM productos p 
            WHERE ${estadoCondition}
        `;
        const params = [];
        if (categoria) { query += ' AND p.id_categoria = ?'; params.push(categoria); }
        if (busqueda) { query += ' AND p.titulo LIKE ?'; params.push(`%${busqueda}%`); }
        if (vendedor) { query += ' AND p.id_vendedor = ?'; params.push(vendedor); }
        const [productos] = await connection.query(query, params);
        res.json({ success: true, productos });
    } catch (err) { 
        console.error("Error en obtenerProductos:", err);
        res.status(500).json({ success: false, message: err.message }); 
    } finally {
        if (connection) connection.release();
    }
};

const obtenerProductoId = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        const [productos] = await connection.query(`
            SELECT p.*, p.decripcion AS descripcion,
                   (SELECT COALESCE(AVG(c.puntiacion), 0) 
                    FROM calificaciones c 
                    JOIN transacciones t ON c.id_transaccion = t.id_transacciones 
                    WHERE t.id_producto = p.id_producto) AS calificacion_promedio
            FROM productos p 
            WHERE p.id_producto = ?
        `, [id]);
        if (productos.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, producto: productos[0] });
    } catch (err) { 
        console.error("Error en obtenerProductoId:", err);
        res.status(500).json({ success: false, message: err.message }); 
    } finally {
        if (connection) connection.release();
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, precio, descripcion } = req.body;

        // Validar que al menos UN campo esté siendo actualizado
        if (titulo === undefined && precio === undefined && descripcion === undefined) {
            return res.status(400).json({ 
                success: false, 
                errors: ['Debes modificar al menos un campo'] 
            });
        }

        // Si viene precio, validarlo
        if (precio !== undefined && precio !== '') {
            const validacionPrecio = validarPrecio(precio);
            if (!validacionPrecio.valido) {
                return res.status(400).json({ 
                    success: false, 
                    errors: [validacionPrecio.error] 
                });
            }
        }

        // Si viene título, validarlo
        if (titulo !== undefined && titulo.trim() !== '') {
            const validacionTitulo = validarContenidoApropiado(titulo);
            if (!validacionTitulo.valido) {
                return res.status(400).json({ 
                    success: false, 
                    errors: [validacionTitulo.error] 
                });
            }
        }

        // Si viene descripción, validarla
        if (descripcion !== undefined && descripcion.trim() !== '') {
            const validacionDescripcion = validarContenidoApropiado(descripcion);
            if (!validacionDescripcion.valido) {
                return res.status(400).json({ 
                    success: false, 
                    errors: [validacionDescripcion.error] 
                });
            }
        }

        // Construir la query dinámicamente solo con los campos que vienen
        let updateQuery = 'UPDATE productos SET ';
        const updateValues = [];

        if (titulo !== undefined && titulo.trim() !== '') {
            updateQuery += 'titulo = ?, ';
            updateValues.push(titulo);
        }

        if (precio !== undefined && precio !== '') {
            updateQuery += 'precio = ?, ';
            updateValues.push(precio);
        }

        if (descripcion !== undefined) {
            updateQuery += 'decripcion = ?, ';
            updateValues.push(descripcion);
        }

        // Remover la última coma y espacio
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE id_producto = ?';
        updateValues.push(id);

        const connection = await pool.getConnection();
        await connection.query(updateQuery, updateValues);
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
        // Si el que hace la petición es administrador, lo "suspende", si es artesano lo "pausa"
        const estado = req.user.tipo_usuario === 'administrador' ? 'suspendido' : 'pausado';
        
        const connection = await pool.getConnection();
        await connection.query('UPDATE productos SET estado_producto = ? WHERE id_producto = ?', [estado, id]);
        connection.release();
        res.json({ success: true, message: `Producto ${estado} correctamente` });
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
        
        // Verificación de seguridad: Evitar que el vendedor reactive un producto suspendido por el admin
        if (req.user.tipo_usuario !== 'administrador') {
            const [prods] = await connection.query('SELECT estado_producto FROM productos WHERE id_producto = ?', [id]);
            if (prods.length > 0 && prods[0].estado_producto === 'suspendido') {
                connection.release();
                return res.status(403).json({ success: false, message: 'Este producto fue suspendido por un Administrador y no puede ser reactivado.' });
            }
        }

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