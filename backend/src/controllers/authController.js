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
    try {
        const { error, value } = registroSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { nombre, email, password, tipo_usuario } = value;
        const connection = await pool.getConnection();

        // Verificar si email existe
        const [existing] = await connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Email ya registrado' });
        }

        // Hash del password
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

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            id_usuario
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, errors: error.details.map(d => d.message) });

        const { email, password } = value;
        const connection = await pool.getConnection();

        const [users] = await connection.query('SELECT * FROM usuarios WHERE email = ? AND eliminado = FALSE', [email]);
        connection.release();

        if (users.length === 0 || !(await bcrypt.compare(password, users[0].password_hash))) {
            return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
        }

        const user = users[0];
        const token = jwt.sign(
            { id_usuario: user.id_usuario, email: user.email, tipo_usuario: user.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            usuario: { id_usuario: user.id_usuario, nombre: user.nombre, tipo_usuario: user.tipo_usuario }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// NUEVA FUNCIÓN: Traer a todos los usuarios para el panel de Admin
const obtenerUsuarios = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [usuarios] = await connection.query('SELECT id_usuario, nombre, email, tipo_usuario, fecha_registro FROM usuarios');
        connection.release();

        res.json({ success: true, usuarios });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Se agregó obtenerUsuarios a la exportación
module.exports = { registro, login, obtenerUsuarios };