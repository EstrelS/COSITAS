import { useEffect, useState } from 'react';
import { FaBox, FaExclamationTriangle, FaShoppingCart, FaUsers } from 'react-icons/fa';
import axiosInstance from '../config/axiosConfig';

const PanelAdmin = () => {
  const [stats, setStats] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchReportes();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportes = async () => {
    try {
      const response = await axiosInstance.get('/reportes');
      setReportes(response.data.reportes || []);
    } catch (err) {
      console.error('Error fetching reportes:', err);
    }
  };

  const handleResolverReporte = async (id_reporte, estado) => {
    try {
      await axiosInstance.patch(`/admin/reportes/${id_reporte}/resolver`, { estado });
      fetchReportes();
    } catch (err) {
      console.error('Error resolviendo reporte:', err);
    }
  };

  if (loading) {
    return <div className="container text-center py-12">Cargando...</div>;
  }

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">Panel Administrativo</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center gap-4">
            <FaUsers className="text-3xl text-blue-600" />
            <div>
              <p className="text-gray-600">Usuarios</p>
              <p className="text-3xl font-bold">{stats?.usuarios || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <FaBox className="text-3xl text-green-600" />
            <div>
              <p className="text-gray-600">Productos</p>
              <p className="text-3xl font-bold">{stats?.productos || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <FaShoppingCart className="text-3xl text-purple-600" />
            <div>
              <p className="text-gray-600">Transacciones</p>
              <p className="text-3xl font-bold">{stats?.transacciones || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <FaExclamationTriangle className="text-3xl text-red-600" />
            <div>
              <p className="text-gray-600">Reportes Pendientes</p>
              <p className="text-3xl font-bold">{stats?.reportes_pendientes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reportes */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Reportes Pendientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Motivo</th>
                <th className="text-left p-4">Descripción</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte) => (
                <tr key={reporte.id_reporte} className="border-b hover:bg-gray-50">
                  <td className="p-4">{reporte.motivo_reporte}</td>
                  <td className="p-4 truncate">{reporte.descripcion}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded text-sm ${
                      reporte.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                      reporte.estado === 'resuelto' ? 'bg-green-200 text-green-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {reporte.estado}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {reporte.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleResolverReporte(reporte.id_reporte, 'resuelto')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Resolver
                        </button>
                        <button
                          onClick={() => handleResolverReporte(reporte.id_reporte, 'rechazado')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PanelAdmin;
