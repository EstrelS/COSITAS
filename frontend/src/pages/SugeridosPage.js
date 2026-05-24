import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

const SugeridosPage = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSugeridos = async () => {
            try {
                const response = await axiosInstance.get('/productos');
                // Ordenamos los productos por sus estrellas de mayor a menor y agarramos los 10 mejores
                const destacados = (response.data.productos || [])
                    .sort((a, b) => b.calificacion_promedio - a.calificacion_promedio)
                    .slice(0, 10);
                setProductos(destacados);
            } catch (err) {
                console.error('Error al cargar sugeridos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSugeridos();
    }, []);

    const obtenerImagenUrl = (fotos) => {
        if (!fotos) return '';
        if (typeof fotos === 'string') {
            if (fotos.startsWith('[') && fotos.endsWith(']')) {
                try { return JSON.parse(fotos)[0] || ''; } catch (e) { return fotos; }
            }
            return fotos;
        }
        if (Array.isArray(fotos)) return fotos[0] || '';
        return '';
    };

    if (loading) return <div className="container py-12 text-center">Cargando recomendaciones...</div>;

    return (
        <div className="container py-8">
            <h1 className="text-4xl font-bold mb-2">Para ti ✨</h1>
            <p className="text-gray-600 mb-8">Nuestra mejor selección de productos artesanales destacados por la comunidad.</p>
            
            {productos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aún no hay suficientes datos para darte recomendaciones.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {productos.map((producto) => (
                        <Link key={producto.id_producto} to={`/productos/${producto.id_producto}`} className="card hover:shadow-lg transition h-full flex flex-col">
                            <div className="w-full h-48 bg-gray-200 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
                                {obtenerImagenUrl(producto.fotos) ? (
                                    <img src={obtenerImagenUrl(producto.fotos)} alt={producto.titulo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                                )}
                            </div>
                            <h3 className="font-bold text-lg mb-1 mt-2 truncate">{producto.titulo}</h3>
                            <p className="text-xl font-bold text-blue-600 mb-2">${producto.precio}</p>
                            <div className="flex items-center gap-1 text-yellow-400 font-bold"><FaStar /> {Number(producto.calificacion_promedio || 0).toFixed(1)}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SugeridosPage;