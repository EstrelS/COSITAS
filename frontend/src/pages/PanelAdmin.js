import { useState, useEffect } from 'react';
import { FaBox, FaExclamationTriangle, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';

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
    } catch (err) { console.error('Error stats:', err); } finally { setLoading(false); }
  };

  const fetchReportes = async () => {
    try {
      const response = await axiosInstance.get('/reportes');
      setReportes(response.data.reportes || []);
    } catch (err) { console.error('Error reportes:', err); }
  };

  const handleResolverReporte = async (id, estado) => {
    try {
      await axiosInstance.patch(`/admin/reportes/${id}/resolver`, { estado });
      fetchReportes();
    } catch (err) { toast.error('Error al resolver'); }
  };

  if (loading) return <div className="container text-center py-12">Cargando...</div>;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Panel Administrativo</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="card p-4"><FaUsers className="text-3xl text-blue-600 mb-2" /><p className="text-gray-600">Usuarios</p><p className="text-3xl font-bold">{stats?.usuarios || 0}</p></div>
        <div className="card p-4"><FaBox className="text-3xl text-green-600 mb-2" /><p className="text-gray-600">Productos</p><p className="text-3xl font-bold">{stats?.productos || 0}</p></div>
        <div className="card p-4"><FaShoppingCart className="text-3xl text-purple-600 mb-2" /><p className="text-gray-600">Transacciones</p><p className="text-3xl font-bold">{stats?.transacciones || 0}</p></div>
        <div className="card p-4"><FaExclamationTriangle className="text-3xl text-red-600 mb-2" /><p className="text-gray-600">Reportes Pendientes</p><p className="text-3xl font-bold">{stats?.reportes_pendientes || 0}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reportes Table */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Reportes Pendientes</h2>
          {reportes.map(r => (
            <div key={r.id_reporte} className="border-b py-4 flex justify-between items-center">
              <div><p className="font-bold">{r.motivo_reporte}</p><p className="text-sm text-gray-500">{r.descripcion}</p></div>
              <button onClick={() => handleResolverReporte(r.id_reporte, 'resuelto')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Resolver</button>
            </div>
          ))}
        </div>

        {/* Acceso a Gestión de Productos */}
        <div className="card p-6 border-l-4 border-red-500">
          <h2 className="text-2xl font-bold mb-2">Gestión de Inventario</h2>
          <p className="text-gray-600 mb-4">Administra productos desactivados y reactívalos aquí.</p>
          <Link 
            to="/admin/productos-desactivados" 
            className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-bold"
          >
            Ver productos desactivados
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PanelAdmin;