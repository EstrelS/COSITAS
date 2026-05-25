import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaComments, FaHeart, FaRegHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [esReferencia, setEsReferencia] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const { usuario, isAuthenticated } = authStore();

  // Estados para el Modal de Editar (Admin)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [formEditar, setFormEditar] = useState({ titulo: '', precio: '', descripcion: '' });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

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

  // Lógica de Edición (Admin)
  const abrirModalEditar = () => {
    setFormEditar({
      titulo: producto.titulo,
      precio: producto.precio,
      descripcion: producto.descripcion || ''
    });
    setMostrarModalEditar(true);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setGuardandoEdicion(true);
    try {
      await axiosInstance.patch(`/admin/productos/${id}/editar`, formEditar);
      toast.success('Producto editado exitosamente por Admin');
      setMostrarModalEditar(false);
      fetchProducto(); // Recargar los datos visuales
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || 'Error al editar producto');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // Lógica para herramientas del Vendedor
  const handlePausar = async () => {
    try {
      await axiosInstance.patch(`/productos/${id}/pausar`);
      toast.success('Producto pausado correctamente');
      fetchProducto(); // Recarga para actualizar el estado visual
    } catch (err) { toast.error('Error al pausar el producto'); }
  };

  const handleAgregarCarrito = async () => {
    if (!isAuthenticated) return toast.error('Inicia sesión para comprar');
    try {
      await axiosInstance.post('/carrito', { id_producto: id, cantidad });
      toast.success('Producto agregado al carrito');
    } catch (err) {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleAgregarFavorito = async () => {
    if (!isAuthenticated) return toast.error('Inicia sesión para agregar a favoritos');
    try {
      await axiosInstance.post('/favoritos', { id_producto: id });
      toast.success('Agregado a favoritos exitosamente');
    } catch (err) {
      toast.error('Error al agregar a favoritos (quizás ya lo tienes)');
    }
  };

  const handleComprarAhora = async () => {
    if (!isAuthenticated) return toast.error('Inicia sesión para comprar');
    try {
      await axiosInstance.post('/carrito', { id_producto: id, cantidad });
      navigate('/carrito'); // Redirige directamente al carrito para proceder al pago
    } catch (err) {
      toast.error('Error al procesar la compra');
    }
  };

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
              {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Math.round(producto.calificacion_promedio || 0) ? 'text-yellow-400' : 'text-gray-300'} />)}
            </div>
            <span className="font-bold text-gray-700">{Number(producto.calificacion_promedio || 0).toFixed(1)} estrellas</span>
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
              <button onClick={abrirModalEditar} className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 transition shadow">Editar información</button>
              <button onClick={() => navigate(`/artesanos/${producto.id_vendedor}`)} className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-black transition-colors shadow-md">Ver perfil del vendedor</button>
            </div>
          )}
          
          {/* Herramientas exclusivas del Vendedor (creador del producto) */}
          {usuario?.id_usuario === producto.id_vendedor && (
            <div className="mt-6 flex flex-col gap-3 border-t pt-4">
              <p className="text-gray-600 font-bold mb-2">Tus herramientas de vendedor:</p>
              <div className="flex gap-2">
                <button onClick={() => navigate('/dashboard/artesano')} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 transition shadow">
                  Modificar en Panel
                </button>
                {producto.estado_producto === 'activo' && (
                  <button onClick={handlePausar} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow">
                    Pausar Producto
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Descripción del producto */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Descripción</h2>
            <div className="bg-white p-4 rounded-xl border shadow-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {producto.descripcion || 'Sin descripción disponible.'}
            </div>
          </div>

          {/* Acciones de compra (sólo para compradores o invitados, no para el creador del producto) */}
          {usuario?.tipo_usuario !== 'administrador' && usuario?.id_usuario !== producto.id_vendedor && (
            <div className="mt-8 space-y-4 border-t pt-6">
              <div className="flex items-center gap-4">
                <label className="font-bold text-gray-700">Cantidad:</label>
                <input 
                  type="number" 
                  min="1" 
                  max={producto.cantidad_disponible || 1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="border rounded px-4 py-2 w-24 bg-gray-50 focus:bg-white"
                />
                <span className="text-sm text-gray-500">
                  ({producto.cantidad_disponible} disponibles)
                </span>
              </div>
              
              <div className="flex gap-4">
                <button onClick={handleAgregarCarrito} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 shadow-md flex justify-center items-center gap-2 transition-all">
                  <FaShoppingCart /> Agregar al Carrito
                </button>
                <button onClick={handleAgregarFavorito} className="px-4 py-3 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center">
                  <FaHeart className="text-2xl" />
                </button>
              </div>
              <button onClick={handleComprarAhora} className="w-full mt-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-orange-600 shadow-md flex justify-center items-center transition-all">
                Comprar Ahora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Comentarios y Reseñas */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaComments className="text-gray-400" /> Opiniones del Producto
        </h2>
        {calificaciones.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            Aún no hay opiniones para este producto. ¡Sé el primero en comprarlo y dejar una reseña!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calificaciones.map((cal, idx) => (
              <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800">{cal.nombre_comprador || cal.nombre || 'Comprador verificado'}</span>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => <FaStar key={i} className={i < (cal.calificacion || cal.puntiacion || 5) ? 'text-yellow-400' : 'text-gray-300'} />)}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">{cal.comentario}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL EDITAR PRODUCTO (SÓLO ADMIN) --- */}
      {mostrarModalEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Editar Producto (Admin)</h2>
            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Título</label>
                <input type="text" required value={formEditar.titulo} onChange={e => setFormEditar({...formEditar, titulo: e.target.value})} disabled={guardandoEdicion} className="w-full border rounded px-3 py-2 disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Precio (COP)</label>
                <input type="number" required min="1" value={formEditar.precio} onChange={e => setFormEditar({...formEditar, precio: e.target.value})} disabled={guardandoEdicion} className="w-full border rounded px-3 py-2 disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Descripción</label>
                <textarea required value={formEditar.descripcion} onChange={e => setFormEditar({...formEditar, descripcion: e.target.value})} disabled={guardandoEdicion} className="w-full border rounded px-3 py-2 disabled:opacity-50" rows="4"></textarea>
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setMostrarModalEditar(false)} disabled={guardandoEdicion} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={guardandoEdicion} className="flex-1 bg-yellow-500 text-white py-2 rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-md disabled:opacity-50">{guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoDetalle;