import { useEffect, useState } from 'react';
import { FaBox, FaHeart, FaTrash, FaStar, FaEdit, FaUserCircle, FaKey } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';

const DashboardComprador = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesandoFavorito, setProcesandoFavorito] = useState(null);

  // Estados para Edición de Perfil
  const { usuario } = authStore();
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [formPerfil, setFormPerfil] = useState({ nombre: '', foto_perfil_url: '' });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewPerfil, setPreviewPerfil] = useState('');
  const [subiendoPerfil, setSubiendoPerfil] = useState(false);

  // Estados para Cambiar Contraseña
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [formPassword, setFormPassword] = useState({ password_antigua: '', password_nueva: '' });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  // Estados para el Modal de Reseñas
  const [modalResena, setModalResena] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [formResena, setFormResena] = useState({ calificacion: 5, comentario: '' });
  const [enviandoResena, setEnviandoResena] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    // 1. Pedimos las compras por separado (Si falla lo demás, esto sí carga)
    try {
      const transRes = await axiosInstance.get('/transacciones');
      setTransacciones(transRes.data.transacciones || []);
    } catch (err) {
      console.error('Error al cargar transacciones:', err);
    }

    // 2. Pedimos los favoritos
    try {
      const favRes = await axiosInstance.get('/favoritos');
      setFavoritos(favRes.data.favoritos || []);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
    }

    // 3. Pedir datos actuales del perfil para el modal
    try {
      const perfilRes = await axiosInstance.get('/usuarios/perfil');
      if (perfilRes.data.usuario) {
        setFormPerfil({
          nombre: perfilRes.data.usuario.nombre || '',
          foto_perfil_url: perfilRes.data.usuario.foto_perfil_url || ''
        });
        setPreviewPerfil(perfilRes.data.usuario.foto_perfil_url || '');
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err);
    }

    setLoading(false);
  };

  const handleEditarPerfil = async (e) => {
    e.preventDefault();
    setSubiendoPerfil(true);
    try {
      let urlFoto = formPerfil.foto_perfil_url;
      if (fotoPerfil) {
        const formData = new FormData();
        formData.append('fotos', fotoPerfil);
        const resUpload = await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (resUpload.data.urls && resUpload.data.urls.length > 0) {
          urlFoto = resUpload.data.urls[0];
        }
      }
      await axiosInstance.put('/usuarios/perfil', { nombre: formPerfil.nombre, foto_perfil_url: urlFoto });
      toast.success('Perfil actualizado correctamente');
      setMostrarModalPerfil(false);
      setFotoPerfil(null);
      fetchData(); 
    } catch (err) { toast.error('Error al actualizar el perfil'); } 
    finally { setSubiendoPerfil(false); }
  };

  const handleEliminarFavorito = async (id_producto) => {
    if (procesandoFavorito === id_producto) return;
    setProcesandoFavorito(id_producto);
    try {
      await axiosInstance.delete(`/favoritos/${id_producto}`);
      setFavoritos(favoritos.filter(f => f.id_producto !== id_producto));
      toast.success('Producto eliminado de favoritos');
    } catch (err) {
      toast.error('Error al eliminar de favoritos');
    } finally {
      setProcesandoFavorito(null);
    }
  };

  const abrirModalResena = (trans) => {
    setTransaccionSeleccionada(trans);
    setFormResena({ calificacion: 5, comentario: '' });
    setModalResena(true);
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
        id_transaccion: transaccionSeleccionada.id_transacciones,
        calificacion: Number(formResena.calificacion),
        comentario: formResena.comentario
      });
      toast.success('¡Reseña publicada con éxito! Aparecerá en el producto.');
      setModalResena(false);
      fetchData(); // Recargamos para actualizar el estado del botón
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Error al publicar la reseña';
      toast.error(errorMsg);
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setCambiandoPassword(true);
    try {
      await axiosInstance.post('/usuarios/cambiar-password', formPassword);
      toast.success('Contraseña actualizada correctamente');
      setMostrarModalPassword(false);
      setFormPassword({ password_antigua: '', password_nueva: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setCambiandoPassword(false);
    }
  };

  const obtenerImagenUrl = (fotos) => {
    if (!fotos) return '';
    if (typeof fotos === 'string') {
        if (fotos.startsWith('[') && fotos.endsWith(']')) {
            try { return JSON.parse(fotos)[0] || ''; } catch (e) { return fotos; }
        }
        return fotos;
    }
    if (Array.isArray(fotos)) return fotos[0] || '';
    return '';
  };

  if (loading) return <div className="container py-12 text-center">Cargando perfil...</div>;

  return (
    <div className="container">
      {/* Cabecera del Perfil Integrada */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-6">
          {previewPerfil ? (
            <img src={previewPerfil} alt="Perfil" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-gray-100 shadow-sm">
              <FaUserCircle className="text-6xl" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{formPerfil.nombre || usuario?.nombre}</h1>
            <p className="text-gray-500">Comprador verificado</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <button onClick={() => setMostrarModalPerfil(true)} className="btn-secondary flex items-center justify-center gap-2 font-bold shadow-sm">
            <FaEdit /> Editar Perfil
          </button>
          <button onClick={() => setMostrarModalPassword(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-sm">
            <FaKey /> Cambiar Contraseña
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center gap-4">
            <FaBox className="text-3xl text-blue-600" />
            <div>
              <p className="text-gray-600">Mis Compras</p>
              <p className="text-3xl font-bold">{transacciones.length}</p>
            </div>
          </div>
        </div>

        <div className="card cursor-pointer hover:bg-gray-50 transition shadow-sm" onClick={() => document.getElementById('seccion-favoritos')?.scrollIntoView({behavior: 'smooth'})}>
          <div className="flex items-center gap-4">
            <FaHeart className="text-3xl text-red-600" />
            <div>
              <p className="text-gray-600">Favoritos</p>
              <p className="text-3xl font-bold">{favoritos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Mis Compras Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Producto</th>
                <th className="text-left p-4">Monto</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Fecha</th>
                <th className="text-center p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.slice(0, 5).map((trans) => (
                <tr key={trans.id_transacciones} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Link to={`/productos/${trans.id_producto}`} className="text-blue-600 font-bold hover:underline">
                      {trans.titulo}
                    </Link>
                  </td>
                  <td className="p-4">${trans.monto_total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      trans.estado_transaccion === 'completada' ? 'bg-green-200 text-green-800' : 
                      trans.estado_transaccion === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {trans.estado_transaccion || 'Completada'}
                    </span>
                  </td>
                  <td className="p-4">{new Date(trans.fecha_transaccion).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    {trans.ya_calificado > 0 ? (
                      <span className="text-gray-500 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full inline-block">Calificado ✓</span>
                    ) : (
                      <button onClick={() => abrirModalResena(trans)} className="bg-yellow-400 text-white px-3 py-1 rounded shadow text-sm font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-1 mx-auto">
                        <FaStar /> Calificar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Favoritos Detallados */}
      <div id="seccion-favoritos" className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Mis Favoritos</h2>
        {favoritos.length === 0 ? (
          <p className="text-gray-500">Aún no tienes productos agregados a favoritos.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritos.map((fav) => (
              <div key={fav.id_producto} className="flex gap-4 items-center border p-4 rounded hover:bg-gray-50 transition-colors">
                {obtenerImagenUrl(fav.fotos) ? (
                  <img src={obtenerImagenUrl(fav.fotos)} alt={fav.titulo} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 text-center">Sin foto</div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/productos/${fav.id_producto}`} className="font-bold text-lg hover:text-blue-600 block truncate">{fav.titulo}</Link>
                  <p className="text-blue-600 font-semibold">${fav.precio}</p>
                </div>
                <button 
                  onClick={() => handleEliminarFavorito(fav.id_producto)} 
                  disabled={procesandoFavorito === fav.id_producto}
                  className="text-red-600 p-2 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Calificar */}
      {modalResena && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Calificar Producto</h2>
            <p className="mb-4 text-gray-600">¿Qué te pareció <b>{transaccionSeleccionada?.titulo}</b>?</p>
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

      {/* Modal Editar Perfil Comprador */}
      {mostrarModalPerfil && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Editar Mi Perfil</h2>
            <form onSubmit={handleEditarPerfil} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Foto de Perfil</label>
                <div className="flex items-center gap-4">
                  {previewPerfil ? (
                    <img src={previewPerfil} alt="Preview" className="w-16 h-16 rounded-full object-cover border shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 shadow-sm">Sin foto</div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => { if(e.target.files[0]) { setFotoPerfil(e.target.files[0]); setPreviewPerfil(URL.createObjectURL(e.target.files[0])); } }} disabled={subiendoPerfil} className="flex-1 border rounded px-3 py-2 text-sm bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Nombre Completo</label>
                <input required type="text" value={formPerfil.nombre} onChange={e => setFormPerfil({...formPerfil, nombre: e.target.value})} disabled={subiendoPerfil} className="w-full border rounded px-3 py-2 focus:bg-white" />
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => { setMostrarModalPerfil(false); setFotoPerfil(null); setPreviewPerfil(formPerfil.foto_perfil_url || ''); }} disabled={subiendoPerfil} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={subiendoPerfil} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 shadow-md disabled:opacity-50 transition-all">
                  {subiendoPerfil ? '⏳ Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {mostrarModalPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FaKey /> Cambiar Contraseña
            </h2>
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Contraseña Actual</label>
                <input required type="password" placeholder="Ingresa tu contraseña actual..." value={formPassword.password_antigua} onChange={e => setFormPassword({...formPassword, password_antigua: e.target.value})} disabled={cambiandoPassword} className="w-full border rounded px-3 py-2 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Nueva Contraseña</label>
                <input required type="password" placeholder="Crea una contraseña segura..." value={formPassword.password_nueva} onChange={e => setFormPassword({...formPassword, password_nueva: e.target.value})} disabled={cambiandoPassword} className="w-full border rounded px-3 py-2 focus:bg-white" minLength="6" />
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => { setMostrarModalPassword(false); setFormPassword({password_antigua: '', password_nueva: ''}); }} disabled={cambiandoPassword} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={cambiandoPassword} className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold hover:bg-black shadow-md disabled:opacity-50 transition-all">
                  {cambiandoPassword ? '⏳ Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardComprador;