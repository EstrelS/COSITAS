const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    } 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ success: false, message: 'Token inválido' });
    }
};

const verifyRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.tipo_usuario)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        next();
    };
};

module.exports = { verifyToken, verifyRole };
