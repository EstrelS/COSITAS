import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPaperPlane } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';

const ChatPage = () => {
  const { id_conversacion } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(true);
  const usuario = authStore((state) => state.usuario);

  useEffect(() => {
    fetchMensajes();
    const interval = setInterval(fetchMensajes, 2000);
    return () => clearInterval(interval);
  }, [id_conversacion]);

  const fetchMensajes = async () => {
    try {
      const response = await axiosInstance.get(`/mensajes/${id_conversacion}`);
      setMensajes(response.data.mensajes || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching mensajes:', err);
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;

    try {
      await axiosInstance.post('/mensajes', {
        id_conversacion,
        contenido
      });
      setContenido('');
      fetchMensajes();
    } catch (err) {
      toast.error('Error al enviar mensaje');
    }
  };

  if (loading) {
    return <div className="container text-center py-12">Cargando chat...</div>;
  }

  return (
    <div className="container h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 card">
        <div className="space-y-4 p-4">
          {mensajes.map((msg) => (
            <div
              key={msg.id_mensaje}
              className={`flex ${msg.id_emisor === usuario?.id_usuario ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.id_emisor === usuario?.id_usuario
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{msg.contenido}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleEnviarMensaje} className="flex gap-2">
        <input
          type="text"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <FaPaperPlane /> Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
