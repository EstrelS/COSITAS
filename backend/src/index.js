const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { csrfMiddleware } = require('./middleware/csrfMiddleware');

dotenv.config();

const app = express();

// ============== MIDDLEWARES DE SEGURIDAD ==============
app.use(helmet());
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));

// ============== MIDDLEWARES DE PARSEO ==============
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============== MIDDLEWARE CSRF ==============
app.use(csrfMiddleware);

// ============== RUTAS ==============
app.use('/api/v1/csrf', require('./routes/csrfRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/v1/artesanos', require('./routes/artesanoRoutes'));
app.use('/api/v1/productos', require('./routes/productoRoutes'));
app.use('/api/v1/carrito', require('./routes/carritoRoutes'));
app.use('/api/v1/categorias', require('./routes/categoriaRoutes'));
app.use('/api/v1/transacciones', require('./routes/transaccionRoutes'));
app.use('/api/v1/calificaciones', require('./routes/calificacionRoutes'));
app.use('/api/v1/conversaciones', require('./routes/conversacionRoutes'));
app.use('/api/v1/mensajes', require('./routes/mensajeRoutes'));
app.use('/api/v1/favoritos', require('./routes/favoritoRoutes'));
app.use('/api/v1/notificaciones', require('./routes/notificacionRoutes'));
app.use('/api/v1/reportes', require('./routes/reporteRoutes'));
app.use('/api/v1/ubicaciones', require('./routes/ubicacionRoutes'));
app.use('/api/v1/busqueda', require('./routes/busquedaRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/upload', require('./routes/uploadRoutes'));

// ============== MANEJO DE ERRORES ==============
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ============== RUTA 404 ==============
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// ============== INICIAR SERVIDOR ==============
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Servidor COSITAS ejecutándose en puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});

module.exports = app;
