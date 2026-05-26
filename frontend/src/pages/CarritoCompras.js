import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const CarritoCompras = () => {
  const [carrito, setCarrito] = useState([]);
  const [procesandoIds, setProcesandoIds] = useState([]);
  const [mostrarPagoModal, setMostrarPagoModal] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const cargarCarrito = async () => {
    try {
      const res = await axiosInstance.get('/carrito');
      setCarrito(res.data.carrito || []);
    } catch (err) {
      toast.error('Error al cargar el carrito');
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  const obtenerImagenUrl = (fotos) => {
    if (!fotos) return '';
    if (typeof fotos === 'string') {
        if (fotos.startsWith('[') && fotos.endsWith(']')) {
            try {
                return JSON.parse(fotos)[0] || '';
            } catch (e) { return fotos; }
        }
        return fotos;
    }
    if (Array.isArray(fotos)) { return fotos[0] || ''; }
    return '';
  };

  const actualizarCantidad = async (id_producto, nueva_cantidad) => {
    if (procesandoIds.includes(id_producto)) return;
    if (nueva_cantidad <= 0) {
      eliminarDelCarrito(id_producto);
      return;
    }
    
    setProcesandoIds(prev => [...prev, id_producto]);
    try {
      const cantidadActual = carrito.find(i => i.id_producto === id_producto)?.cantidad || 0;
      await axiosInstance.post('/carrito', { id_producto: Number(id_producto), cantidad: Number(nueva_cantidad - cantidadActual) });
      await cargarCarrito();
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setProcesandoIds(prev => prev.filter(id => id !== id_producto));
    }
  };

  const eliminarDelCarrito = async (id_producto) => {
    if (procesandoIds.includes(id_producto)) return;
    setProcesandoIds(prev => [...prev, id_producto]);
    try {
      await axiosInstance.delete(`/carrito/${id_producto}`);
      await cargarCarrito();
      toast.success('Producto removido');
    } catch (err) {
      toast.error('Error al eliminar');
    } finally {
      setProcesandoIds(prev => prev.filter(id => id !== id_producto));
    }
  };

  const procesarPagoCarrito = async (e) => {
    e.preventDefault();
    setProcesandoPago(true);
    try {
      // Creamos una compra por cada producto en el carrito y lo borramos
      for (const item of carrito) {
        await axiosInstance.post('/transacciones', { id_producto: Number(item.id_producto), cantidad: Number(item.cantidad) });
        await axiosInstance.delete(`/carrito/${item.id_producto}`);
      }
      toast.success('¡Pago exitoso! Gracias por tu compra.');
      setMostrarPagoModal(false);
      await cargarCarrito();
    } catch (err) {
      toast.error('Error al procesar el pago de algunos productos.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">Carrito de Compras</h1>
      {carrito.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-xl text-gray-500">Tu carrito está vacío</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {carrito.map((item) => (
              <div key={item.id_producto} className="card flex gap-4 items-center">
                {obtenerImagenUrl(item.foto) ? (
                  <img src={obtenerImagenUrl(item.foto)} alt={item.nombre} className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 text-center">Sin foto</div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold">{item.nombre}</h3>
                  <p className="text-blue-600">${item.precio}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)} disabled={procesandoIds.includes(item.id_producto)} className="btn-secondary p-2 disabled:opacity-50">
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center">{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad + 1)} disabled={procesandoIds.includes(item.id_producto)} className="btn-secondary p-2 disabled:opacity-50">
                    <FaPlus />
                  </button>
                </div>
                <button onClick={() => eliminarDelCarrito(item.id_producto)} disabled={procesandoIds.includes(item.id_producto)} className="text-red-600 disabled:opacity-50">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          <div className="card h-fit">
            <h2 className="text-2xl font-bold mb-4">Total: ${total.toFixed(2)}</h2>
            <button onClick={() => setMostrarPagoModal(true)} className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-orange-600 shadow-md transition-all duration-300">
              Proceder al Pago
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DE PAGO (CHECKOUT) --- */}
      {mostrarPagoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Finalizar Compra</h2>
            <form onSubmit={procesarPagoCarrito} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Nombre en la Tarjeta</label>
                <input required type="text" placeholder="Ej. Emiliano" className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Dirección de Envío</label>
                <input required type="text" placeholder="Calle, Número, Ciudad, Estado..." className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Número de Tarjeta</label>
                <input required type="text" placeholder="0000 0000 0000 0000" maxLength="16" pattern="\d*" title="Solo 16 números" className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Vencimiento</label>
                  <input required type="text" placeholder="MM/AA" maxLength="5" className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">CVV</label>
                  <input required type="password" placeholder="123" maxLength="4" className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setMostrarPagoModal(false)} className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={procesandoPago} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 shadow-md disabled:opacity-50 transition-all duration-300">
                  {procesandoPago ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoCompras;