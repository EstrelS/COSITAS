import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { FaRedo, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const GestionProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      // Asegúrate de que esta ruta coincida exactamente con tu adminRoutes.js
      const res = await axiosInstance.get('/admin/productos/gestion');
      setProductos(res.data.productos || []);
    } catch (err) { 
      toast.error('Error al cargar la lista'); 
      console.error(err);
    }
  };

  const handleReactivar = async (id_producto) => {
    try {
      // IMPORTANTE: Verifica que esta ruta sea idéntica a la que pusiste en adminRoutes.js
      await axiosInstance.patch(`/admin/productos/${id_producto}/reactivar`);
      
      toast.success('Producto reactivado exitosamente');
      cargarProductos(); // Refresca la lista
    } catch (err) { 
      console.error("Error completo:", err.response?.data || err);
      toast.error(err.response?.data?.message || 'Error al reactivar el producto'); 
    }
  };

  return (
    <div className="container py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black font-bold">
        <FaArrowLeft /> Volver al Panel
      </button>
      
      <h1 className="text-3xl font-bold mb-6">Productos Desactivados</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        {productos.filter(p => p.estado_producto === 'suspendido').length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay productos suspendidos actualmente.</p>
        ) : (
            productos.filter(p => p.estado_producto === 'suspendido').map(p => (
            <div key={p.id_producto} className="flex justify-between items-center p-4 border-b hover:bg-gray-50">
                <div>
                  <p className="font-bold text-lg">{p.titulo}</p>
                  <p className="text-sm text-gray-500">ID: {p.id_producto}</p>
                </div>
                <button 
                  onClick={() => handleReactivar(p.id_producto)} 
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 font-bold"
                >
                  <FaRedo /> Reactivar
                </button>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default GestionProductosPage;