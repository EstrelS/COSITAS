const crypto = require('crypto');

// Almacenar tokens válidos en memoria (en producción usar Redis)
const validTokens = new Set();

const generarCSRFToken = (req, res) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        validTokens.add(token);

        // Guardar también en sesión/cookie si es necesario
        res.json({ 
            success: true, 
            csrf_token: token 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Error generando token CSRF' 
        });
    }
};

const validarCSRFToken = (token) => {
    if (!token || !validTokens.has(token)) {
        return false;
    }
    // Usar token una sola vez
    validTokens.delete(token);
    return true;
};

module.exports = { 
    generarCSRFToken, 
    validarCSRFToken 
};
