import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaComments, FaHeart, FaRegHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [esReferencia, setEsReferencia] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const { usuario, isAuthenticated } = authStore();

  useEffect(() => {
    fetchProducto();
    fetchCalificaciones();
  }, [id]);

  const fetchProducto = async () => {
    try {
      const response = await axiosInstance.get(`/productos/${id}`);
      setProducto(response.data.producto);
    } catch (err) {
      toast.error('Producto no encontrado');
    }
  };

  const fetchCalificaciones = async () => {
    try {
      const response = await axiosInstance.get(`/calificaciones/producto/${id}`);
      setCalificaciones(response.data.calificaciones || []);
    } catch (err) {
      console.error('Error fetching calificaciones:', err);
    }
  };

  // Lógica de Suspensión
  const handleDarDeBaja = async () => {
    try {
      await axiosInstance.patch(`/admin/productos/${id}/suspender`);
      toast.success('Producto dado de baja');
      fetchProducto();
    } catch (err) { toast.error('Error al suspender'); }
  };

  // Lógica de Reactivación
  const handleReactivar = async () => {
    try {
      await axiosInstance.patch(`/admin/productos/${id}/reactivar`);
      toast.success('Producto reactivado');
      fetchProducto();
    } catch (err) { toast.error('Error al reactivar'); }
  };

  // ... (tus funciones handleAgregarFavorito, handleComprar, etc., se mantienen igual)

  if (!producto) return <div className="container text-center py-12">Cargando...</div>;

  const fotos = typeof producto.fotos === 'string' ? JSON.parse(producto.fotos) : producto.fotos || [];

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-200 h-96 rounded-lg overflow-hidden flex items-center justify-center">
            {fotos.length > 0 ? <img src={fotos[0]} alt={producto.titulo} className="w-full h-full object-cover" /> : <span className="text-gray-400">Sin imagen</span>}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{producto.titulo}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Math.round(producto.calificacion_promedio) ? 'text-yellow-400' : 'text-gray-300'} />)}
            </div>
            <span>{producto.calificacion_promedio || 0} estrellas</span>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-3xl font-bold text-blue-600">${producto.precio}</p>
            <p className="text-sm">Estado: {producto.estado_producto}</p>
          </div>

          {/* Lógica de botones Admin */}
          {usuario?.tipo_usuario === 'administrador' && (
            <div className="flex flex-col gap-2">
              {producto.estado_producto === 'suspendido' ? (
                <button onClick={handleReactivar} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold">Reactivar Producto</button>
              ) : (
                <button onClick={handleDarDeBaja} className="w-full bg-red-600 text-white py-2 rounded-lg font-bold">Dar de baja</button>
              )}
              <button className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold">Editar información</button>
            </div>
          )}
          
          {/* ... resto de tu contenido original ... */}
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;