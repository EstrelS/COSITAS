import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaComments, FaHeart, FaRegHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [esReferencia, setEsReferencia] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formEditar, setFormEditar] = useState({ titulo: '', precio: '', descripcion: '' });

  // ✅ NUEVO: estados para bloquear botones mientras cargan
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [agregandoFavorito, setAgregandoFavorito] = useState(false);
  const [iniciandoChat, setIniciandoChat] = useState(false);

  const { usuario, isAuthenticated } = authStore();

  useEffect(() => {
    fetchProducto();
    fetchCalificaciones();
  }, [id]);

  const fetchProducto = async () => {
    try {
      const response = await axiosInstance.get(`/productos/${id}`);
      setProducto(response.data.producto);
      setFormEditar({
        titulo: response.data.producto.titulo,
        precio: response.data.producto.precio,
        descripcion: response.data.producto.descripcion || response.data.producto.descripcion_producto || response.data.producto.decripcion || ''
      });
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
      if (usuario.tipo_usuario === 'administrador') {
        await axiosInstance.patch(`/admin/productos/${id}/suspender`);
      } else {
        await axiosInstance.patch(`/productos/${id}/pausar`);
      }
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

  // Lógica de Edición
  const handleEditarProducto = async () => {
    const tieneValorTitulo = formEditar.titulo && formEditar.titulo.trim() !== '';
    const tieneValorPrecio = formEditar.precio && formEditar.precio !== '';
    const tieneValorDescripcion = formEditar.descripcion !== undefined && formEditar.descripcion !== '';

    if (!tieneValorTitulo && !tieneValorPrecio && !tieneValorDescripcion) {
      toast.error('Modifica al menos un campo');
      return;
    }

    setEditando(true);
    try {
      const datosActualizar = {};
      if (tieneValorTitulo) datosActualizar.titulo = formEditar.titulo;
      if (tieneValorPrecio) datosActualizar.precio = parseFloat(formEditar.precio);
      if (tieneValorDescripcion) datosActualizar.descripcion = formEditar.descripcion;

      if (usuario.tipo_usuario === 'administrador') {
        await axiosInstance.patch(`/admin/productos/${id}/editar`, datosActualizar);
      } else {
        await axiosInstance.put(`/productos/${id}`, datosActualizar);
      }
      toast.success('Producto actualizado correctamente');
      setMostrarEditarModal(false);
      fetchProducto();
    } catch (err) {
      const errores = err.response?.data?.errors || ['Error al actualizar'];
      errores.forEach(e => toast.error(e));
    } finally {
      setEditando(false);
    }
  };

  // ✅ CORREGIDO: Agregar a favoritos — bloquea mientras procesa
  const handleAgregarFavorito = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión');
      return;
    }
    if (agregandoFavorito) return; // 🔒 bloquea doble clic
    setAgregandoFavorito(true);
    try {
      await axiosInstance.post('/favoritos', { id_producto: id });
      setEsReferencia(!esReferencia);
      toast.success(esReferencia ? 'Removido de favoritos' : 'Agregado a favoritos');
    } catch (err) {
      toast.error('Error al actualizar favorito');
    } finally {
      setAgregandoFavorito(false); // 🔓 desbloquea siempre
    }
  };

  // ✅ CORREGIDO: Agregar al carrito — bloquea mientras procesa
  const handleAgregarCarrito = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión');
      return;
    }
    if (agregandoCarrito) return; // 🔒 bloquea doble clic
    setAgregandoCarrito(true);
    try {
      await axiosInstance.post('/carrito', { id_producto: id, cantidad });
      toast.success('Producto agregado al carrito');
    } catch (err) {
      toast.error('Error al agregar al carrito');
    } finally {
      setAgregandoCarrito(false); // 🔓 desbloquea siempre
    }
  };

  // ✅ CORREGIDO: Realizar compra — bloquea mientras procesa
  const handleComprar = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión');
      return;
    }
    if (comprando) return; // 🔒 bloquea doble clic
    setComprando(true);
    try {
      await axiosInstance.post('/transacciones', { id_producto: id, cantidad });
      toast.success('Compra realizada');
      fetchProducto();
    } catch (err) {
      toast.error('Error al realizar compra');
    } finally {
      setComprando(false); // 🔓 desbloquea siempre
    }
  };

  // ✅ NUEVO: Lógica para crear y redirigir al chat
  const handleCrearChat = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para chatear');
      return;
    }
    if (iniciandoChat) return;
    setIniciandoChat(true);
    try {
      const res = await axiosInstance.post('/conversaciones', {
        id_usuario_2: producto.id_vendedor
      });
      navigate(`/chat/${res.data.id_conversacion}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al iniciar el chat';
      toast.error('Error: ' + errorMsg);
    } finally {
      setIniciandoChat(false);
    }
  };

  if (!producto) return <div className="container text-center py-12">Cargando...</div>;

  const fotos = typeof producto.fotos === 'string' ? JSON.parse(producto.fotos) : producto.fotos || [];

  const textoDescripcion = (producto.descripcion || producto.descripcion_producto || producto.decripcion || '').trim();
  const descripcionMostrar = textoDescripcion.length > 0 ? textoDescripcion : 'Sin descripción disponible';
  const esPropietario = usuario?.id_usuario === producto?.id_vendedor;

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- COLUMNA IZQUIERDA: Imagen y Descripción --- */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-200 h-96 rounded-lg overflow-hidden flex items-center justify-center">
            {fotos.length > 0
              ? <img src={fotos[0]} alt={producto.titulo} className="w-full h-full object-cover" />
              : <span className="text-gray-400">Sin imagen</span>
            }
          </div>

          {/* Descripción (Movida aquí abajo de la imagen) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Descripción del Producto</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{descripcionMostrar}</p>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: Info, Botones y Reseñas --- */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-4">{producto.titulo}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(producto.calificacion_promedio || 0) ? 'text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span>{Number(producto.calificacion_promedio || 0).toFixed(1)} estrellas</span>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-3xl font-bold text-blue-600">${producto.precio}</p>
            <p className="text-sm">Estado: {producto.estado_producto}</p>
          </div>

          {/* Botones Admin */}
          {usuario?.tipo_usuario === 'administrador' && (
            <div className="flex flex-col gap-2">
              {producto.estado_producto === 'suspendido' ? (
                <button onClick={handleReactivar} className="w-full bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white py-3 rounded-2xl font-bold hover:from-pink-700 hover:via-red-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                  Reactivar Producto
                </button>
              ) : (
                <button onClick={handleDarDeBaja} className="w-full bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white py-3 rounded-2xl font-bold hover:from-pink-700 hover:via-red-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                  Dar de baja
                </button>
              )}
              <button onClick={() => setMostrarEditarModal(true)} className="w-full bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white py-3 rounded-2xl font-bold hover:from-pink-700 hover:via-red-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                Editar información
              </button>
              <button 
                onClick={() => {
                  if (producto.id_vendedor) {
                    window.location.href = `/artesanos/${producto.id_vendedor}`;
                  } else {
                    toast.error('Este producto no tiene un vendedor asociado en la base de datos');
                  }
                }} 
                className="w-full bg-gray-800 text-white py-3 rounded-2xl font-bold text-center hover:bg-gray-900 transition-all duration-300 shadow-md hover:scale-[1.02]"
              >
                Ver Perfil del Vendedor
              </button>
            </div>
          )}

          {/* Botones Propietario (Artesano dueño del producto) */}
          {usuario?.tipo_usuario === 'artesano' && esPropietario && (
            <div className="flex flex-col gap-3">
              <div className="bg-yellow-100 text-yellow-800 py-2 rounded-xl font-bold text-center border border-yellow-300">
                🌟 Este es tu producto
              </div>
              <button onClick={() => setMostrarEditarModal(true)} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:scale-[1.02]">
                Editar mi producto
              </button>
              {producto.estado_producto === 'activo' && (
                <button onClick={handleDarDeBaja} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-2xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md hover:scale-[1.02]">
                  Pausar mi producto
                </button>
              )}
            </div>
          )}

          {/* Botones Comprador */}
          {usuario?.tipo_usuario !== 'administrador' && !esPropietario && producto.estado_producto === 'activo' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max={producto.cantidad_disponible}
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value))}
                  className="w-20 border rounded px-2 py-2 font-semibold"
                />
                {/* ✅ disabled mientras agrega al carrito */}
                <button
                  onClick={handleAgregarCarrito}
                  disabled={agregandoCarrito}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaShoppingCart />
                  {agregandoCarrito ? 'Agregando...' : 'Agregar al Carrito'}
                </button>
              </div>

              {/* ✅ disabled mientras compra */}
              <button
                onClick={handleComprar}
                disabled={comprando}
                className="w-full bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white py-4 rounded-2xl font-bold hover:from-pink-700 hover:via-red-600 hover:to-orange-600 text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {comprando ? 'Procesando...' : 'Comprar Ahora'}
              </button>

              <div className="flex gap-2">
                {/* ✅ disabled mientras agrega a favoritos */}
                <button
                  onClick={handleAgregarFavorito}
                  disabled={agregandoFavorito}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {esReferencia ? <FaHeart /> : <FaRegHeart />}
                  {agregandoFavorito ? 'Guardando...' : 'Favoritos'}
                </button>
                
                {/* ✅ Conectado con la lógica del chat */}
                <button 
                  onClick={handleCrearChat}
                  disabled={iniciandoChat}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaComments /> {iniciandoChat ? 'Cargando...' : 'Chat'}
                </button>
              </div>
            </div>
          )}

          {/* Reseñas (Se quedan a la derecha, debajo de los botones) */}
          <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Reseñas de Compradores</h2>
            {calificaciones.length > 0 ? (
              <div className="space-y-4">
                {calificaciones.map(cal => (
                  <div key={cal.id_calificacion} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < cal.calificacion ? 'text-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    <p className="text-gray-700">{cal.comentario}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Sin calificaciones aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {mostrarEditarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Editar Producto</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Título</label>
                <input
                  type="text"
                  value={formEditar.titulo}
                  onChange={(e) => setFormEditar({ ...formEditar, titulo: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Título del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Precio (COP)</label>
                <input
                  type="number"
                  value={formEditar.precio}
                  onChange={(e) => setFormEditar({ ...formEditar, precio: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: 50000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea
                  value={formEditar.descripcion}
                  onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Descripción del producto"
                  rows="4"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setMostrarEditarModal(false)}
                disabled={editando}
                className="flex-1 border-2 border-pink-500 text-pink-600 py-3 rounded-2xl font-semibold hover:bg-pink-50 transition-all duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditarProducto}
                disabled={editando}
                className="flex-1 bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white py-3 rounded-2xl font-semibold hover:from-pink-700 hover:via-red-600 hover:to-orange-600 transition-all duration-300 shadow-md disabled:opacity-50"
              >
                {editando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoDetalle;
