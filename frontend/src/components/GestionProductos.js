import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);

  const cargarProductos = async () => {
    try {
      // Usaremos la ruta que creamos para traer TODO (incluidos los suspendidos)
      const res = await axiosInstance.get('/admin/productos/gestion');
      setProductos(res.data.productos);
    } catch (err) { toast.error('Error al cargar lista'); }
  };

  useEffect(() => { cargarProductos(); }, []);

  const reactivar = async (id) => {
    try {
      await axiosInstance.patch(`/admin/productos/${id}/reactivar`);
      toast.success('Producto reactivado');
      cargarProductos(); // Refresca la lista sin recargar toda la página
    } catch (err) { toast.error('Error al reactivar'); }
  };

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
      <h2 className="text-xl font-bold mb-4">Gestión de Productos Suspendidos</h2>
      <div className="space-y-2">
        {productos.filter(p => p.estado_producto === 'suspendido').map(p => (
          <div key={p.id_producto} className="flex justify-between items-center p-3 bg-white rounded shadow-sm border">
            <span className="font-medium">{p.titulo}</span>
            <button 
              onClick={() => reactivar(p.id_producto)} 
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Reactivar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GestionProductos;