import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const CarritoCompras = () => {
  const [carrito, setCarrito] = useState([]);
  const [procesandoIds, setProcesandoIds] = useState([]);

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
      await axiosInstance.post('/carrito', { id_producto, cantidad: nueva_cantidad - cantidadActual });
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
            <button className="w-full btn-primary">Proceder al Pago</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoCompras;