import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const CarritoCompras = () => {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const carritoLocal = localStorage.getItem('carrito');
    if (carritoLocal) {
      setCarrito(JSON.parse(carritoLocal));
    }
  }, []);

  const actualizarCantidad = (id, nueva_cantidad) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id_producto === id ? { ...item, cantidad: nueva_cantidad } : item
    ).filter((item) => item.cantidad > 0);
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  };

  const eliminarDelCarrito = (id) => {
    const nuevoCarrito = carrito.filter((item) => item.id_producto !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    toast.success('Producto removido del carrito');
  };

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

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
              <div key={item.id_producto} className="card flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden">
                  {item.foto ? (
                    <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sin img</div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.nombre}</h3>
                  <p className="text-blue-600 font-bold text-lg">${item.precio}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)}
                    className="btn-secondary p-2"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item.id_producto, parseInt(e.target.value))}
                    className="input-field w-16 text-center"
                  />
                  <button
                    onClick={() => actualizarCantidad(item.id_producto, item.cantidad + 1)}
                    className="btn-secondary p-2"
                  >
                    <FaPlus />
                  </button>
                </div>

                <button
                  onClick={() => eliminarDelCarrito(item.id_producto)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="card h-fit">
            <h2 className="text-2xl font-bold mb-4">Resumen</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full btn-primary">
              Proceder al Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoCompras;
