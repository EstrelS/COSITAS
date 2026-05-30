import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaComments, FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaFlag, FaPlus } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [esFavorito, setEsFavorito] = useState(false);
  const { usuario, isAuthenticated } = authStore();

  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [formEditar, setFormEditar] = useState({ titulo: '', precio: '', descripcion: '' });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [formReporte, setFormReporte] = useState({ motivo: '', descripcion: '' });
  const [enviandoReporte, setEnviandoReporte] = useState(false);

  const [transaccionPendiente, setTransaccionPendiente] = useState(null);
  const [modalResena, setModalResena] = useState(false);
  const [formResena, setFormResena] = useState({ calificacion: 5, comentario: '' });
  const [enviandoResena, setEnviandoResena] = useState(false);

  useEffect(() => {
    fetchProducto();
    fetchCalificaciones();
    if (isAuthenticated) {
      checkFavorito();
      checkTransaccionPendiente();
    }
  }, [id, isAuthenticated]);

  const checkFavorito = async () => {
    try {
      const res = await axiosInstance.get('/favoritos');
      const favoritos = res.data.favoritos || [];
      const enFavoritos = favoritos.some(fav => String(fav.id_producto) === String(id));
      setEsFavorito(enFavoritos);
    } catch (err) {
      console.error('Error verificando favoritos:', err);
    }
  };

  const checkTransaccionPendiente = async () => {
    try {
      const res = await axiosInstance.get('/transacciones');
      const transacciones = res.data.transacciones || [];
      const pendiente = transacciones.find(t => String(t.id_producto) === String(id) && t.ya_calificado === 0);
      setTransaccionPendiente(pendiente || null);
    } catch (err) {
      console.error('Error verificando compras:', err);
    }
  };

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

  const handleDarDeBaja = async () => {
    try {
      await axiosInstance.patch(`/admin/productos/${id}/suspender`);
      toast.success('Producto dado de baja');
      fetchProducto();
    } catch (err) { toast.error('Error al suspender'); }
  };

  const handleReactivar = async () => {
    try {
      await axiosInstance.patch(`/admin/productos/${id}/reactivar`);
      toast.success('Producto reactivado');
      fetchProducto();
    } catch (err) { toast.error('Error al reactivar'); }
  };

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
      fetchProducto(); 
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || 'Error al editar producto');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handlePausar = async () => {
    try {
      await axiosInstance.patch(`/productos/${id}/pausar`);
      toast.success('Producto pausado correctamente');
      fetchProducto(); 
    } catch (err) { toast.error('Error al pausar el producto'); }
  };

  // --- LÓGICA DE CARRITO ACTUALIZADA A LOCALSTORAGE ---
  const agregarAlNavegador = () => {
    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    const indice = carritoActual.findIndex(item => String(item.id_producto) === String(id));

    if (indice !== -1) {
      carritoActual[indice].cantidad += cantidad;
    } else {
      carritoActual.push({
        id_producto: id,
        nombre: producto.titulo,
        precio: producto.precio,
        foto: producto.fotos, 
        cantidad: cantidad
      });
    }
    localStorage.setItem('carrito', JSON.stringify(carritoActual));
  };

  const handleAgregarCarrito = () => {
    if (!isAuthenticated) return toast.error('Inicia sesión para comprar');
    try {
      agregarAlNavegador();
      toast.success('Producto agregado al carrito');
    } catch (err) {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleComprarAhora = () => {
    if (!isAuthenticated) return toast.error('Inicia sesión para comprar');
    try {
      agregarAlNavegador();
      navigate('/carrito'); 
    } catch (err) {
      toast.error('Error al procesar la compra');
    }
  };
  // ----------------------------------------------------

  const handleToggleFavorito = async () => {
    if (!isAuthenticated) return toast.error('Inicia sesión para agregar a favoritos');
    try {
      if (esFavorito) {
        await axiosInstance.delete(`/favoritos/${id}`);
        setEsFavorito(false);
        toast.success('Producto eliminado de favoritos');
      } else {
        await axiosInstance.post('/favoritos', { id_producto: id });
        setEsFavorito(true);
        toast.success('Agregado a favoritos exitosamente');
      }
    } catch (err) {
      toast.error('Error al actualizar favoritos');
    }
  };

  const handleEnviarReporte = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Inicia sesión para reportar');
    setEnviandoReporte(true);
    try {
      await axiosInstance.post('/reportes', {
        id_producto_reportado: Number(id),
        motivo_reporte: formReporte.motivo,
        descripcion: formReporte.descripcion
      });
      toast.success('Reporte enviado a los administradores');
      setMostrarModalReporte(false);
      setFormReporte({ motivo: '', descripcion: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Error al enviar el reporte';
      toast.error(errorMsg);
    } finally {
      setEnviandoReporte(false);
    }
  };

  const enviarResena = async (e) => {
    e.preventDefault();
    if (!formResena.comentario.trim()) {
      toast.error('Por favor escribe tu opinión antes de publicar.');
      return;
    }
    setEnviandoResena(true);
    try {
      await axiosInstance.post('/calificaciones', {
        id_transaccion: transaccionPendiente.id_transacciones,
        calificacion: Number(formResena.calificacion),
        comentario: formResena.comentario
      });
      toast.success('¡Reseña publicada con éxito!');
      setModalResena(false);
      setTransaccionPendiente(null);
      fetchCalificaciones(); 
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || 'Error al publicar la reseña');
    } finally {
      setEnviandoResena(false);
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

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Descripción</h2>
            <div className="bg-white p-4 rounded-xl border shadow-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {producto.descripcion || 'Sin descripción disponible.'}
            </div>
          </div>

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
                <button onClick={handleToggleFavorito} className={`px-4 py-3 border-2 rounded-xl transition-colors flex items-center justify-center ${esFavorito ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                  {esFavorito ? <FaHeart className="text-2xl" /> : <FaRegHeart className="text-2xl" />}
                </button>
              </div>
              <button onClick={handleComprarAhora} className="w-full mt-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-orange-600 shadow-md flex justify-center items-center transition-all">
                Comprar Ahora
              </button>

              <button 
                onClick={() => {
                  if (!isAuthenticated) return toast.error('Inicia sesión para reportar');
                  setMostrarModalReporte(true);
                }} 
                className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <FaFlag /> Reportar publicación
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaComments className="text-gray-400" /> Opiniones del Producto
          </h2>
          {transaccionPendiente && (
            <button onClick={() => setModalResena(true)} className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-lg shadow-md font-bold flex items-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all">
              <FaPlus /> Añadir reseña
            </button>
          )}
        </div>
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

      {modalResena && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Calificar Producto</h2>
            <p className="mb-4 text-gray-600">¿Qué te pareció <b>{producto.titulo}</b>?</p>
            <form onSubmit={enviarResena} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Estrellas</label>
                <select 
                  value={formResena.calificacion} 
                  onChange={(e) => setFormResena({...formResena, calificacion: e.target.value})}
                  className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5) Excelente</option>
                  <option value="4">⭐⭐⭐⭐ (4) Muy Bueno</option>
                  <option value="3">⭐⭐⭐ (3) Bueno</option>
                  <option value="2">⭐⭐ (2) Regular</option>
                  <option value="1">⭐ (1) Malo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Tu reseña</label>
                <textarea required placeholder="Escribe tu opinión sobre el producto..." value={formResena.comentario} onChange={(e) => setFormResena({...formResena, comentario: e.target.value})} className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white" rows="4"></textarea>
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setModalResena(false)} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={enviandoResena} className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 shadow-md disabled:opacity-50 transition-all">
                  {enviandoResena ? 'Enviando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalReporte && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-600">
              <FaFlag /> Reportar Producto
            </h2>
            <p className="mb-4 text-gray-600">¿Por qué deseas reportar este producto?</p>
            <form onSubmit={handleEnviarReporte} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Motivo</label>
                <select required value={formReporte.motivo} onChange={e => setFormReporte({...formReporte, motivo: e.target.value})} className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white">
                  <option value="">Selecciona un motivo...</option>
                  <option value="Contenido inapropiado o prohibido">Contenido inapropiado o prohibido</option>
                  <option value="Producto falso o estafa">Producto falso o estafa</option>
                  <option value="No es un producto artesanal">No es un producto artesanal</option>
                  <option value="Vendedor fraudulento">Vendedor fraudulento</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Descripción</label>
                <textarea required placeholder="Por favor, proporciona más detalles para ayudar al administrador..." value={formReporte.descripcion} onChange={e => setFormReporte({...formReporte, descripcion: e.target.value})} className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white" rows="4"></textarea>
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setMostrarModalReporte(false)} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={enviandoReporte} className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold hover:bg-red-700 shadow-md disabled:opacity-50 transition-all">
                  {enviandoReporte ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoDetalle;