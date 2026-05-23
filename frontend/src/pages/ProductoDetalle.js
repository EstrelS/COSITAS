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

  const handleAgregarFavorito = async () => {
    if (!isAuthenticated) { toast.error('Debes iniciar sesión'); return; }
    try {
      await axiosInstance.post('/favoritos', { id_producto: id });
      setEsReferencia(true);
      toast.success('Agregado a favoritos');
    } catch (err) { toast.error('Error al agregar a favoritos'); }
  };

  const handleComprar = async () => {
    if (!isAuthenticated) { toast.error('Debes iniciar sesión'); return; }
    try {
      await axiosInstance.post('/transacciones', { id_producto: id, cantidad });
      toast.success('Compra realizada');
    } catch (err) { toast.error(err.response?.data?.message || 'Error en la compra'); }
  };

  const handleAgregarCarrito = () => { toast.success('Producto añadido al carrito'); };

  const handleContactarArtesano = async () => {
    if (!isAuthenticated) { toast.error('Debes iniciar sesión'); return; }
    try {
      await axiosInstance.post('/conversaciones', { id_usuario_2: producto.id_vendedor, id_producto_relacionado: id });
      toast.success('Conversación creada');
    } catch (err) { toast.error('Error al crear conversación'); }
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
              {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Math.round(producto.calificacion_promedio) ? 'text-yellow-400' : 'text-gray-300'} />)}
            </div>
            <span className="text-gray-600">{producto.calificacion_promedio || 0} estrellas</span>
          </div>
          <p className="text-gray-600 text-lg mb-4">{producto.descripcion}</p>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-3xl font-bold text-blue-600">${producto.precio}</p>
            <p className="text-sm text-gray-600">Stock disponible: {producto.cantidad_disponible}</p>
          </div>

          <div className="space-y-4">
            {usuario?.tipo_usuario === 'administrador' ? (
                <div className="flex flex-col gap-2">
                    <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-bold">Dar de baja producto</button>
                    <button className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-bold">Editar información</button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <label className="font-bold">Cantidad:</label>
                        <input type="number" min="1" max={producto.cantidad_disponible} value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))} className="input-field w-24" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={handleComprar} className="w-full btn-primary">Comprar Ahora</button>
                        <div className="flex gap-4">
                            <button onClick={handleAgregarCarrito} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800"><FaShoppingCart /> Carrito</button>
                            <button onClick={handleAgregarFavorito} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${esReferencia ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                {esReferencia ? <FaHeart /> : <FaRegHeart />} Favorito
                            </button>
                        </div>
                    </div>
                    <button onClick={handleContactarArtesano} className="w-full btn-secondary flex items-center justify-center gap-2"><FaComments /> Contactar Artesano</button>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;