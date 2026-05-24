import axiosInstance from '../config/axiosConfig';

let csrfToken = null;

/**
 * Obtiene un nuevo token CSRF del servidor
 */
export const obtenerCSRFToken = async () => {
    try {
        const response = await axiosInstance.get('/csrf/csrf-token');
        if (response.data.success) {
            csrfToken = response.data.csrf_token;
            localStorage.setItem('csrf_token', csrfToken);
            return csrfToken;
        }
    } catch (error) {
        console.error('Error obteniendo CSRF token:', error);
    }
    return null;
};

/**
 * Obtiene el token CSRF guardado (o obtiene uno nuevo si no existe)
 */
export const getCSRFToken = async () => {
    if (csrfToken) {
        return csrfToken;
    }

    // Intentar obtener del localStorage
    const stored = localStorage.getItem('csrf_token');
    if (stored) {
        csrfToken = stored;
        return csrfToken;
    }

    // Si no existe, obtener uno nuevo
    return await obtenerCSRFToken();
};

/**
 * Limpiar el token (después de usarlo)
 */
export const limpiarCSRFToken = () => {
    csrfToken = null;
    localStorage.removeItem('csrf_token');
};
