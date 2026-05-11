import create from 'zustand';
import axiosInstance from '../config/axiosConfig';

const productoStore = create((set) => ({
    productos: [],
    loading: false,
    error: null,

    fetchProductos: async (filtros = {}) => {
        set({ loading: true });
        try {
        const response = await axiosInstance.get('/productos', { params: filtros });
        set({ productos: response.data.productos, error: null });
        } catch (err) {
        set({ error: err.message });
        } finally {
        set({ loading: false });
        }
    },

    crearProducto: async (datos) => {
        try {
        const response = await axiosInstance.post('/productos', datos);
        return response.data;
        } catch (err) {
        throw err;
        }
    }
}));

export default productoStore;
