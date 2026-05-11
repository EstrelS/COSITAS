import { useEffect, useState } from 'react';
import { FaBox, FaComments, FaHeart } from 'react-icons/fa';
import axiosInstance from '../config/axiosConfig';

const DashboardComprador = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, favRes, convRes] = await Promise.all([
        axiosInstance.get('/transacciones'),
        axiosInstance.get('/favoritos'),
        axiosInstance.get('/conversaciones')
      ]);

      setTransacciones(transRes.data.transacciones || []);
      setFavoritos(favRes.data.favoritos || []);
      setConversaciones(convRes.data.conversaciones || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">Dashboard Comprador</h1>

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
                <tr key={trans.id_transaccion} className="border-b hover:bg-gray-50">
                  <td className="p-4">{trans.nombre}</td>
                  <td className="p-4">${trans.monto_total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      trans.estado_transaccion === 'completada' ? 'bg-green-200 text-green-800' : 
                      trans.estado_transaccion === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {trans.estado_transaccion}
                    </span>
                  </td>
                  <td className="p-4">{new Date(trans.fecha_transaccion).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardComprador;
