import { useEffect, useState } from 'react';
import { FaBox, FaComments, FaHeart, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axiosConfig';

const DashboardComprador = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesandoFavorito, setProcesandoFavorito] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    // 1. Pedimos las compras por separado (Si falla lo demás, esto sí carga)
    try {
      const transRes = await axiosInstance.get('/transacciones');
      setTransacciones(transRes.data.transacciones || []);
    } catch (err) {
      console.error('Error al cargar transacciones:', err);
    }

    // 2. Pedimos los favoritos
    try {
      const favRes = await axiosInstance.get('/favoritos');
      setFavoritos(favRes.data.favoritos || []);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
    }

    // 3. Pedimos los chats solo si está autenticado
    if (token) {
      try {
        const convRes = await axiosInstance.get('/conversaciones');
        setConversaciones(convRes.data.conversaciones || []);
      } catch (err) {
        console.error('Error al cargar chats:', err);
      }
    }

    setLoading(false);
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

  if (loading) return <div className="container py-12 text-center">Cargando perfil...</div>;

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">Mi perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center gap-4">
            <FaBox className="text-3xl text-blue-600" />
            <div>
              <p className="text-gray-600">Mis Compras</p>
              <p className="text-3xl font-bold">{transacciones.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <FaHeart className="text-3xl text-red-600" />
            <div>
              <p className="text-gray-600">Favoritos</p>
              <p className="text-3xl font-bold">{favoritos.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <FaComments className="text-3xl text-green-600" />
            <div>
              <p className="text-gray-600">Chats</p>
              <p className="text-3xl font-bold">{conversaciones.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Mis Compras Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Producto</th>
                <th className="text-left p-4">Monto</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.slice(0, 5).map((trans) => (
                <tr key={trans.id_transacciones} className="border-b hover:bg-gray-50">
                  <td className="p-4">{trans.titulo}</td>
                  <td className="p-4">${trans.monto_total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      trans.estado_transaccion === 'completada' ? 'bg-green-200 text-green-800' : 
                      trans.estado_transaccion === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {trans.estado_transaccion || 'Completada'}
                    </span>
                  </td>
                  <td className="p-4">{new Date(trans.fecha_transaccion).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Favoritos Detallados */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Mis Favoritos</h2>
        {favoritos.length === 0 ? (
          <p className="text-gray-500">Aún no tienes productos agregados a favoritos.</p>
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
                <button 
                  onClick={() => handleEliminarFavorito(fav.id_producto)} 
                  disabled={procesandoFavorito === fav.id_producto}
                  className="text-red-600 p-2 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
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

export default DashboardComprador;