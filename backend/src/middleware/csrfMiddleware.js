const { validarCSRFToken } = require('../controllers/csrfController');

const csrfMiddleware = (req, res, next) => {
    // Solo validar en peticiones que modifican datos
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const token = req.headers['x-csrf-token'] || req.body.csrf_token;

        if (!token || !validarCSRFToken(token)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Token CSRF inválido o expirado' 
            });
        }
    }

    next();
};

module.exports = { csrfMiddleware };
