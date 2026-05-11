import axios from '../config/axiosConfig';

const normalizeProducto = (p) => {
    if (!p) return p;
    return {
        // IDs pueden venir como id_producto o id_productos
        id_producto: p.id_producto ?? p.id_productos ?? p.id,
        // Nombre/título
        nombre_producto: p.nombre ?? p.titulo ?? p.nombre_producto ?? p.title ?? null,
        // Descripción
        descripcion_producto: p.descripcion ?? p.decripcion ?? p.decripcion_producto ?? p.descripcion_producto ?? p.description ?? null,
        // Estado
        estado_producto: p.estado_producto ?? p.estado_publicacion ?? p.estado ?? 'activo',
        // Mantener resto de campos
        ...p
    };
};

export const obtenerProductosArtesano = async () => {
    const res = await axios.get('/productos', { params: { vendedor: 'self' } });
    const productos = res.data?.productos ?? res.data ?? [];
    return { data: (Array.isArray(productos) ? productos.map(normalizeProducto) : [normalizeProducto(productos)]) };
};

export const eliminarProducto = async (id) => {
    const res = await axios.delete(`/productos/${id}`);
    return res.data;
};

export const pausarProducto = async (id) => {
    const res = await axios.patch(`/productos/${id}/pausar`);
    return res.data;
};

export default { obtenerProductosArtesano, eliminarProducto, pausarProducto };
