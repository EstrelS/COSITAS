import { useState, useEffect } from 'react';
import { FaBox, FaExclamationTriangle, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';

const PanelAdmin = () => {
  const [stats, setStats] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchReportes();
    fetchUsuarios();
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

  const fetchUsuarios = async () => {
    try {
      const response = await axiosInstance.get('/auth/usuarios');
      // Manejo flexible por si el backend responde con { usuarios: [...] } o directamente [...]
      const dataUsuarios = response.data.usuarios || (Array.isArray(response.data) ? response.data : []);
      setUsuarios(dataUsuarios);
    } catch (err) { 
      console.error('Error usuarios:', err); 
      toast.error('Error al cargar la lista de usuarios');
    }
  };

  const handleResolverReporte = async (id, estado) => {
    try {
      await axiosInstance.patch(`/admin/reportes/${id}/resolver`, { estado });
      fetchReportes();
    } catch (err) { toast.error('Error al resolver'); }
  };

  const handleSuspenderUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de suspender a este usuario? Ya no podrá iniciar sesión.')) return;
    try {
      await axiosInstance.patch(`/admin/usuarios/${id}/suspender`);
      toast.success('Usuario suspendido exitosamente');
      fetchUsuarios();
    } catch (err) { toast.error('Error al suspender'); }
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
          {reportes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay reportes pendientes por revisar en este momento.</p>
          ) : (
            reportes.map(r => (
              <div key={r.id_reporte} className="border-b py-4 flex justify-between items-center">
                <div><p className="font-bold">{r.motivo_reporte}</p><p className="text-sm text-gray-500">{r.descripcion}</p></div>
                <button onClick={() => handleResolverReporte(r.id_reporte, 'resuelto')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Resolver</button>
              </div>
            ))
          )}
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

      {/* Gestión de Usuarios */}
      <div className="card p-6 mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-500">#{u.id_usuario}</td>
                  <td className="p-3 font-bold">{u.nombre}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.tipo_usuario}</td>
                  <td className="p-3">
                    {u.eliminado ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Suspendido</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Activo</span>
                    )}
                  </td>
                  <td className="p-3">
                    {!u.eliminado && u.tipo_usuario !== 'administrador' && (
                      <button onClick={() => handleSuspenderUsuario(u.id_usuario)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-bold transition">
                        Suspender
                      </button>
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