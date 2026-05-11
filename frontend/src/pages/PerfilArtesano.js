import { useEffect, useState } from 'react';
import { FaComments, FaFacebook, FaInstagram, FaStar } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

const PerfilArtesano = () => {
  const { id } = useParams();
  const [artesano, setArtesano] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtesano();
    fetchProductos();
  }, [id]);

  const fetchArtesano = async () => {
    try {
      const response = await axiosInstance.get(`/artesanos/${id}`);
      setArtesano(response.data.artesano);
    } catch (err) {
      console.error('Error fetching artesano:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axiosInstance.get('/productos', {
        params: { vendedor: id }
      });
      setProductos(response.data.productos || []);
    } catch (err) {
      console.error('Error fetching productos:', err);
    }
  };

  if (loading) {
    return <div className="container text-center py-12">Cargando...</div>;
  }

  if (!artesano) {
    return <div className="container text-center py-12">Artesano no encontrado</div>;
  }

  const redesSociales = typeof artesano.redes_sociales === 'string' 
    ? JSON.parse(artesano.redes_sociales) 
    : artesano.redes_sociales || {};

  return (
    <div className="container py-8">
      <div className="card mb-8">
        <div className="flex gap-8">
          <div>
            {artesano.foto_perfil_url ? (
              <img
                src={artesano.foto_perfil_url}
                alt={artesano.nombre}
                className="w-48 h-48 rounded-full object-cover"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                Sin foto
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold">{artesano.nombre}</h1>
                {artesano.verificado && (
                  <p className="text-blue-600 font-bold">✓ Verificado</p>
                )}
              </div>
              <Link to={`/chat`} className="btn-primary flex items-center gap-2">
                <FaComments /> Contactar
              </Link>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(artesano.calificacion_promedio) ? 'text-yellow-400' : 'text-gray-300'} />
              ))}
              <span className="text-gray-600 ml-2">{artesano.calificacion_promedio || 0} estrellas</span>
            </div>

            <p className="text-gray-700 mb-4">{artesano.descripcion}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-600">Especialidad</p>
                <p className="font-bold">{artesano.especialidad}</p>
              </div>
              <div>
                <p className="text-gray-600">Experiencia</p>
                <p className="font-bold">{artesano.años_experiencia} años</p>
              </div>
            </div>

            {Object.keys(redesSociales).length > 0 && (
              <div className="flex gap-4">
                {redesSociales.instagram && (
                  <a href={redesSociales.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 text-2xl">
                    <FaInstagram />
                  </a>
                )}
                {redesSociales.facebook && (
                  <a href={redesSociales.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-2xl">
                    <FaFacebook />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Productos del Artesano</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <Link key={producto.id_producto} to={`/productos/${producto.id_producto}`}>
            <div className="card hover:shadow-lg transition">
              <div className="w-full h-48 bg-gray-200 rounded mb-4 overflow-hidden">
                {producto.fotos && JSON.parse(typeof producto.fotos === 'string' ? producto.fotos : '[""]')[0] ? (
                  <img src={JSON.parse(typeof producto.fotos === 'string' ? producto.fotos : '[""]')[0]} alt={producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 truncate">{producto.nombre}</h3>
              <p className="text-2xl font-bold text-blue-600">${producto.precio}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PerfilArtesano;
