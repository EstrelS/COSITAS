import { useEffect, useState } from 'react';
import { FaEdit, FaPause, FaTrash } from 'react-icons/fa';
import { eliminarProducto, obtenerProductosArtesano, pausarProducto } from '../api/productos';

const DashboardArtesano = () => {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        const fetchProductos = async () => {
        const response = await obtenerProductosArtesano();
        setProductos(response.data);
        };

        fetchProductos();
    }, []);

    const handlePausarProducto = async (id) => {
        await pausarProducto(id);
        setProductos(productos.map(producto => producto.id_producto === id ? { ...producto, estado_producto: 'inactivo' } : producto));
    };

    const handleEliminarProducto = async (id) => {
        await eliminarProducto(id);
        setProductos(productos.filter(producto => producto.id_producto !== id));
    };

    return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard Artesano</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((producto) => (
            <div key={producto.id_producto} className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">{producto.nombre_producto}</h2>
                <p className="text-gray-700 mb-2">{producto.descripcion_producto}</p>
                <div className="flex gap-2">
                <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                    <FaEdit /> Editar
                </button>
                {producto.estado_producto === 'activo' && (
                    <button
                    onClick={() => handlePausarProducto(producto.id_producto)}
                    className="flex-1 bg-yellow-600 text-white px-2 py-2 rounded flex items-center justify-center gap-2 hover:bg-yellow-700"
                    >
                    <FaPause /> Pausar
                    </button>
                )}
                <button
                    onClick={() => handleEliminarProducto(producto.id_producto)}
                    className="flex-1 bg-red-600 text-white px-2 py-2 rounded flex items-center justify-center gap-2 hover:bg-red-700"
                >
                    <FaTrash /> Eliminar
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
};

export default DashboardArtesano;