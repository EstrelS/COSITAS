import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const FavoritosArtesanoPage = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [procesandoFavorito, setProcesandoFavorito] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavoritos();
  }, []);

  const fetchFavoritos = async () => {
    try {
      const res = await axiosInstance.get('/favoritos');
      setFavoritos(res.data.favoritos || []);
    } catch (error) { 
      toast.error('Error al cargar favoritos'); 
    }
  };

  const handleEliminarFavorito = async (id_producto) => {
    if (procesandoFavorito === id_producto) return;
    setProcesandoFavorito(id_producto);
    try {
      await axiosInstance.delete(`/favoritos/${id_producto}`);
      setFavoritos(favoritos.filter(f => f.id_producto !== id_producto));
      toast.success('Producto eliminado de favoritos');
    } catch (err) {
      toast.error('Error al eliminar de favoritos');
    } finally {
      setProcesandoFavorito(null);
    }
  };

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

  return (
    <div className="container py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black font-bold">
        <FaArrowLeft /> Volver al Panel
      </button>
      
      <h1 className="text-3xl font-bold mb-6">Mis Favoritos</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        {favoritos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aún no tienes productos agregados a favoritos.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritos.map((fav) => (
              <div key={fav.id_producto} className="flex gap-4 items-center border p-4 rounded hover:bg-gray-50 transition-colors">
                {obtenerImagenUrl(fav.fotos) ? (
                  <img src={obtenerImagenUrl(fav.fotos)} alt={fav.titulo} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 text-center">Sin foto</div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/productos/${fav.id_producto}`} className="font-bold text-lg hover:text-blue-600 block truncate">{fav.titulo}</Link>
                  <p className="text-blue-600 font-semibold">${fav.precio}</p>
                </div>
                <button onClick={() => handleEliminarFavorito(fav.id_producto)} disabled={procesandoFavorito === fav.id_producto} className="text-red-600 p-2 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritosArtesanoPage;