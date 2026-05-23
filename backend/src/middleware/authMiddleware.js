const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    } 

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Aquí se guarda el objeto del usuario (incluyendo tipo_usuario)
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
};

const verifyRole = (...roles) => {
    return (req, res, next) => {
        // Validación: ¿Existe el usuario y tiene un rol?
        if (!req.user || !req.user.tipo_usuario) {
            return res.status(403).json({ success: false, message: 'Acceso denegado: Usuario sin rol definido' });
        }

        // Convertimos a minúsculas para comparar de forma insensible a mayúsculas
        const userRole = req.user.tipo_usuario.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        // LOG DE SEGURIDAD: Ver qué recibe el backend
        console.log(`[AUTH DEBUG] Usuario: ${req.user.id_usuario} | Rol recibido: ${userRole} | Roles permitidos: ${allowedRoles}`);

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Acceso denegado: No tienes permisos suficientes' });
        }
        
        next();
    };
};

module.exports = { verifyToken, verifyRole };