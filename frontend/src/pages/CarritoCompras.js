import { useEffect, useState } from 'react';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const CarritoCompras = () => {
  const [carrito, setCarrito] = useState([]);
  const id_usuario = localStorage.getItem('id_usuario');

  const cargarCarrito = async () => {
    if (!id_usuario) return;
    try {
      const res = await axios.get(`/carrito?id_usuario=${id_usuario}`);
      setCarrito(res.data.carrito || []);
    } catch (err) {
      toast.error('Error al cargar el carrito');
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, [id_usuario]);

  const actualizarCantidad = async (id_producto, nueva_cantidad) => {
    if (nueva_cantidad <= 0) {
      eliminarDelCarrito(id_producto);
      return;
    }
    try {
      await axios.post('/carrito', { id_usuario, id_producto, cantidad: nueva_cantidad - (carrito.find(i=>i.id_producto === id_producto)?.cantidad || 0) });
      cargarCarrito();
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const eliminarDelCarrito = async (id_producto) => {
    try {
      await axios.delete(`/carrito?id_usuario=${id_usuario}&id_producto=${id_producto}`);
      cargarCarrito();
      toast.success('Producto removido');
    } catch (err) {
      toast.error('Error al eliminar');
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
                <img src={item.foto} alt={item.nombre} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold">{item.nombre}</h3>
                  <p className="text-blue-600">${item.precio}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)} className="btn-secondary p-2"><FaMinus /></button>
                  <span className="w-8 text-center">{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad + 1)} className="btn-secondary p-2"><FaPlus /></button>
                </div>
                <button onClick={() => eliminarDelCarrito(item.id_producto)} className="text-red-600"><FaTrash /></button>
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