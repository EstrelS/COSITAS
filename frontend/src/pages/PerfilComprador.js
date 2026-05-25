import { useEffect, useState } from 'react';
import { FaUserCircle, FaStar } from 'react-icons/fa';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

const PerfilComprador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comprador, setComprador] = useState(null);
  const [opiniones, setOpiniones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComprador = async () => {
      try {
        const response = await axiosInstance.get(`/usuarios/${id}`);
        setComprador(response.data.usuario);
        
        const resOp = await axiosInstance.get(`/calificaciones/usuario/${id}`);
        setOpiniones(resOp.data.calificaciones || []);
      } catch (err) {
        console.error('Error fetching comprador:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComprador();
  }, [id]);

  if (loading) return <div className="container text-center py-12">Cargando perfil...</div>;
  if (!comprador) return <div className="container text-center py-12">Comprador no encontrado</div>;

  const obtenerImagenUrl = (fotos) => {
    if (!fotos) return '';
    if (typeof fotos === 'string') {
      try { return JSON.parse(fotos)[0] || ''; } catch (e) { return fotos; }
    }
    if (Array.isArray(fotos)) return fotos[0] || '';
    return '';
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border">
        {/* Encabezado con color */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar Flotante */}
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            {comprador.foto_perfil_url ? (
              <img src={comprador.foto_perfil_url} alt={comprador.nombre} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-400 bg-white">
                <FaUserCircle className="text-6xl" />
              </div>
            )}
          </div>
          
          {/* Información principal */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              {comprador.nombre}
            </h1>
            <p className="text-gray-500 mt-1">Miembro de la comunidad COSITAS</p>
          </div>

          {/* Opiniones dejadas */}
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-400" /> Opiniones escritas por {comprador.nombre}
            </h2>
            {opiniones.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                <p>Aún no hay opiniones públicas para mostrar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opiniones.map((op, idx) => (
                  <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm flex gap-4">
                    <Link to={`/productos/${op.id_producto}`} className="shrink-0">
                      <img src={obtenerImagenUrl(op.fotos)} alt={op.nombre_producto} className="w-16 h-16 object-cover rounded shadow-sm border" />
                    </Link>
                    <div>
                      <Link to={`/productos/${op.id_producto}`} className="font-bold text-gray-800 hover:text-blue-600 block line-clamp-1">{op.nombre_producto}</Link>
                      <div className="flex text-yellow-400 text-sm my-1">
                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < op.calificacion ? 'text-yellow-400' : 'text-gray-300'} />)}
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{op.comentario || <span className="italic text-gray-400">Calificó este producto sin dejar comentario.</span>}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilComprador;