import { useEffect, useState } from 'react';
import { FaBox, FaEdit, FaEye, FaPause, FaPlay, FaPlus, FaTrash, FaUserCircle, FaHeart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';

const DashboardArtesano = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [procesandoID, setProcesandoID] = useState(null);
    const [favoritos, setFavoritos] = useState([]);
    const [procesandoFavorito, setProcesandoFavorito] = useState(null);
    const [transacciones, setTransacciones] = useState([]);
    const { usuario } = authStore();

    // Estados para Modales
    const [categorias, setCategorias] = useState([]);
    const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
    const [formProducto, setFormProducto] = useState({ titulo: '', precio: '', cantidad_disponible: 1, descripcion: '', id_categoria: '' });
    const [fotosSeleccionadas, setFotosSeleccionadas] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [subiendo, setSubiendo] = useState(false);

    const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
    const [formPerfil, setFormPerfil] = useState({ especialidad: '', descripcion: '', años_experiencia: 0 });
    
    // Estados para la foto de perfil
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [previewPerfil, setPreviewPerfil] = useState('');
    const [subiendoPerfil, setSubiendoPerfil] = useState(false);

    // Estados Editar Producto
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [formEditar, setFormEditar] = useState({ id_producto: null, titulo: '', precio: '', descripcion: '' });
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);
    const [mostrarModalPausados, setMostrarModalPausados] = useState(false);
    // NUEVOS ESTADOS PARA FOTO DE EDICIÓN
    const [fotoEdicion, setFotoEdicion] = useState(null);
    const [previewEdicion, setPreviewEdicion] = useState('');

    // Estados para Reseñas
    const [modalResena, setModalResena] = useState(false);
    const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
    const [formResena, setFormResena] = useState({ calificacion: 5, comentario: '' });
    const [enviandoResena, setEnviandoResena] = useState(false);

    useEffect(() => {
        if (usuario?.id_usuario) {
            fetchProductos();
            fetchCategoriasYPerfil();
            fetchFavoritos();
            fetchTransacciones();
        }
    }, [usuario]);

    const fetchCategoriasYPerfil = async () => {
        try {
            const resCat = await axiosInstance.get('/categorias');
            setCategorias(resCat.data.categorias || []);

            const resPerf = await axiosInstance.get(`/artesanos/${usuario.id_usuario}`);
            if (resPerf.data.artesano) {
                setFormPerfil({
                    especialidad: resPerf.data.artesano.especialidad || '',
                    descripcion: resPerf.data.artesano.descripcion || '',
                    años_experiencia: resPerf.data.artesano.años_experiencia || 0,
                    foto_perfil_url: resPerf.data.artesano.foto_perfil_url || ''
                });
                setPreviewPerfil(resPerf.data.artesano.foto_perfil_url || '');
            }
        } catch (error) { console.error('Error al cargar datos adicionales'); }
    };

    const fetchProductos = async () => {
        try {
            const response = await axiosInstance.get('/productos', {
                params: { vendedor: usuario.id_usuario, incluir_inactivos: 'true' }
            });
            setProductos(response.data.productos || []);
        } catch (error) {
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavoritos = async () => {
        try {
            const res = await axiosInstance.get('/favoritos');
            setFavoritos(res.data.favoritos || []);
        } catch (error) { console.error('Error al cargar favoritos'); }
    };

    const fetchTransacciones = async () => {
        try {
            const response = await axiosInstance.get('/transacciones');
            setTransacciones(response.data.transacciones || []);
        } catch (error) {
            console.error('Error al cargar transacciones:', error);
        }
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

    const handleFotosChange = (e) => {
        const archivos = Array.from(e.target.files);
        setFotosSeleccionadas(archivos);
        
        const newPreviews = archivos.map(archivo => {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = (event) => resolve(event.target.result);
                reader.readAsDataURL(archivo);
            });
        });
        
        Promise.all(newPreviews).then(setPreviews);
    };

    const handleCrearProducto = async (e) => {
        e.preventDefault();
        setSubiendo(true);
        try {
            let urlsFotos = [];
            
            // Si hay fotos, subirlas primero
            if (fotosSeleccionadas.length > 0) {
                const formData = new FormData();
                fotosSeleccionadas.forEach(foto => formData.append('fotos', foto));
                
                try {
                    const resUpload = await axiosInstance.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    urlsFotos = resUpload.data.urls || [];
                } catch (uploadErr) {
                    toast.error('Error al subir fotos');
                    setSubiendo(false);
                    return;
                }
            }
            
            // Crear producto con las URLs de fotos
            const productoData = { ...formProducto, fotos: urlsFotos };
            await axiosInstance.post('/productos', productoData);
            toast.success('Producto publicado exitosamente');
            setMostrarModalProducto(false);
            fetchProductos();
            setFormProducto({ titulo: '', precio: '', cantidad_disponible: 1, descripcion: '', id_categoria: categorias[0]?.id_categoria || '' });
            setFotosSeleccionadas([]);
            setPreviews([]);
        } catch (err) {
            toast.error(err.response?.data?.errors?.[0] || 'Error al crear producto');
        } finally {
            setSubiendo(false);
        }
    };

    const abrirModalEditar = (producto) => {
        setFormEditar({
            id_producto: producto.id_producto,
            titulo: producto.titulo,
            precio: producto.precio,
            descripcion: producto.descripcion || ''
        });
        setFotoEdicion(null);
        setPreviewEdicion(obtenerImagenUrl(producto.fotos));
        setMostrarModalEditar(true);
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        setGuardandoEdicion(true);
        try {
            let payload = { ...formEditar };

            // Si el usuario seleccionó una nueva foto, la subimos primero a Cloudinary
            if (fotoEdicion) {
                const formData = new FormData();
                formData.append('fotos', fotoEdicion); // Enviamos a tu ruta /upload
                const resUpload = await axiosInstance.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (resUpload.data.urls && resUpload.data.urls.length > 0) {
                    payload.fotos = resUpload.data.urls; // Agregamos la URL nueva al payload
                }
            }

            await axiosInstance.put(`/productos/${formEditar.id_producto}`, payload);
            toast.success('Producto actualizado exitosamente');
            setMostrarModalEditar(false);
            fetchProductos();
        } catch (err) {
            toast.error(err.response?.data?.errors?.[0] || 'Error al actualizar producto');
        } finally {
            setGuardandoEdicion(false);
        }
    };

    const handleEditarPerfil = async (e) => {
        e.preventDefault();
        setSubiendoPerfil(true);
        try {
            let urlFoto = formPerfil.foto_perfil_url;
            
            // Si el usuario seleccionó una imagen nueva, la subimos primero
            if (fotoPerfil) {
                const formData = new FormData();
                formData.append('fotos', fotoPerfil); // Usamos 'fotos' porque así lo espera tu ruta /upload
                
                const resUpload = await axiosInstance.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (resUpload.data.urls && resUpload.data.urls.length > 0) {
                    urlFoto = resUpload.data.urls[0];
                }
            }

            const payload = { ...formPerfil, foto_perfil_url: urlFoto };
            await axiosInstance.put('/artesanos/perfil', payload);
            toast.success('Información de perfil actualizada');
            setMostrarModalPerfil(false);
            setFotoPerfil(null);
            fetchCategoriasYPerfil(); // Recargamos para ver la foto nueva
        } catch (err) { 
            toast.error(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Error al actualizar perfil'); 
        } finally {
            setSubiendoPerfil(false);
        }
    };

    const handlePausarProducto = async (id) => {
        if (procesandoID) return;
        setProcesandoID(id);
        try {
            await axiosInstance.patch(`/productos/${id}/pausar`);
            toast.success('Producto pausado');
            fetchProductos();
        } catch(e) { toast.error("Error al pausar"); }
        finally { setProcesandoID(null); }
    };

    const handleReactivarProducto = async (id) => {
        if (procesandoID) return;
        setProcesandoID(id);
        try {
            await axiosInstance.patch(`/productos/${id}/reactivar`);
            toast.success('Producto reactivado exitosamente');
            fetchProductos();
        } catch(err) { 
            toast.error(err.response?.data?.message || "Error al reactivar el producto"); 
        }
        finally { setProcesandoID(null); }
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
            toast.success('¡Reseña publicada con éxito!');
            setModalResena(false);
            fetchTransacciones(); // Recargar para ocultar el botón de calificar
        } catch (err) {
            toast.error(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Error al publicar la reseña');
        } finally {
            setEnviandoResena(false);
        }
    };

    if (loading) return <div className="container py-12 text-center">Cargando dashboard...</div>;

    const productosActivos = productos.filter(p => p.estado_producto === 'activo');

    return (
        <div className="container py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold">Mi Tienda</h1>
                    <p className="text-gray-600 mt-2">Bienvenido, {usuario?.nombre}</p>
                </div>
                <div className="flex gap-4">
                    <Link to={`/artesanos/${usuario?.id_usuario}`} className="btn-secondary flex items-center gap-2">
                        <FaEye /> Ver mi perfil público
                    </Link>
                    <button 
                        onClick={() => setMostrarModalProducto(true)} 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                    >
                        <FaPlus /> Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 text-2xl"><FaBox /></div>
                    <div>
                        <p className="text-gray-600">Total Productos</p>
                        <p className="text-2xl font-bold">{productos.length}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="bg-green-100 p-4 rounded-full text-green-600 text-2xl"><FaUserCircle /></div>
                    <div>
                        <p className="text-gray-600">Mi Perfil</p>
                        <button 
                            onClick={() => setMostrarModalPerfil(true)} 
                            className="text-sm text-green-600 font-bold mt-1 cursor-pointer hover:underline"
                        >
                            Editar información
                        </button>
                    </div>
                </div>
                <div className="card flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition shadow-sm" onClick={() => document.getElementById('seccion-favoritos')?.scrollIntoView({behavior: 'smooth'})}>
                    <div className="bg-red-100 p-4 rounded-full text-red-600 text-2xl"><FaHeart /></div>
                    <div>
                        <p className="text-gray-600">Favoritos</p>
                        <p className="text-2xl font-bold">{favoritos.length}</p>
                    </div>
                </div>
            </div>

            {/* Tarjeta de Gestión de Inventario (Copia del Admin) */}
            <div className="card p-6 border-l-4 border-yellow-500 mb-8">
                <h2 className="text-2xl font-bold mb-2">Gestión de Inventario</h2>
                <p className="text-gray-600 mb-4">Administra tus productos pausados y reactívalos aquí.</p>
                <button 
                    onClick={() => setMostrarModalPausados(true)} 
                    className="inline-block bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 font-bold shadow-md transition"
                >
                    Ver productos pausados
                </button>
            </div>

            <h2 className="text-2xl font-bold mb-6">Mis Productos</h2>
            {productosActivos.length === 0 ? (
                <div className="card text-center py-12 text-gray-500">
                    Aún no tienes productos activos publicados. ¡Anímate a subir el primero!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosActivos.map((producto) => (
                <div key={producto.id_producto} className="card flex flex-col hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
                        {obtenerImagenUrl(producto.fotos) ? (
                            <img src={obtenerImagenUrl(producto.fotos)} alt={producto.titulo} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-bold truncate pr-2">{producto.titulo}</h2>
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${producto.estado_producto === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {producto.estado_producto}
                            </span>
                        </div>
                        <p className="text-blue-600 font-bold text-lg mb-4">${producto.precio}</p>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => abrirModalEditar(producto)} className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm font-bold">
                            <FaEdit /> Editar
                        </button>
                        <button
                            onClick={() => handlePausarProducto(producto.id_producto)}
                            disabled={procesandoID === producto.id_producto}
                            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600 transition disabled:opacity-50 text-sm font-bold"
                        >
                            <FaPause /> {procesandoID === producto.id_producto ? '...' : 'Pausar'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
            )}

            {/* Mis Compras */}
            <div className="mt-12 mb-8">
                <h2 className="text-2xl font-bold mb-6">Mis Compras</h2>
                {transacciones.length === 0 ? (
                    <div className="card text-center py-12 text-gray-500">
                        Aún no has realizado ninguna compra.
                    </div>
                ) : (
                    <div className="card overflow-x-auto">
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
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${trans.estado_transaccion === 'completada' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                {trans.estado_transaccion || 'Completada'}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(trans.fecha_transaccion).toLocaleDateString()}</td>
                                        <td className="p-4 text-center">
                                            {trans.ya_calificado > 0 ? (
                                                <span className="text-gray-500 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full inline-block">Calificado ✓</span>
                                            ) : (
                                                <button onClick={() => abrirModalResena(trans)} className="bg-yellow-400 text-white px-3 py-1 rounded shadow text-sm font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-1 mx-auto"><FaStar /> Calificar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Favoritos Detallados */}
            <div id="seccion-favoritos" className="mt-12 mb-8">
                <h2 className="text-2xl font-bold mb-6">Mis Favoritos</h2>
                {favoritos.length === 0 ? (
                    <div className="card text-center py-12 text-gray-500">
                        Aún no tienes productos agregados a favoritos.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoritos.map((fav) => (
                            <div key={fav.id_producto} className="flex gap-4 items-center card hover:shadow-lg transition-colors p-4">
                                {obtenerImagenUrl(fav.fotos) ? (
                                    <img src={obtenerImagenUrl(fav.fotos)} alt={fav.titulo} className="w-20 h-20 object-cover rounded-lg" />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 text-center">Sin foto</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <Link to={`/productos/${fav.id_producto}`} className="font-bold text-lg hover:text-blue-600 block truncate">{fav.titulo}</Link>
                                    <p className="text-blue-600 font-bold">${fav.precio}</p>
                                </div>
                                <button 
                                    onClick={() => handleEliminarFavorito(fav.id_producto)} 
                                    disabled={procesandoFavorito === fav.id_producto}
                                    className="text-red-600 p-3 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL NUEVO PRODUCTO --- */}
            {mostrarModalProducto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
                        <h2 className="text-2xl font-bold mb-4">Agregar Nuevo Producto</h2>
                        <form onSubmit={handleCrearProducto} className="space-y-4">
                            {/* FOTOS - NUEVA SECCIÓN */}
                            <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 bg-blue-50">
                                <label className="block font-bold text-gray-700 mb-2">📸 Fotos del Producto (Máx. 10)</label>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleFotosChange}
                                    disabled={subiendo}
                                    className="w-full border rounded px-3 py-2 bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {fotosSeleccionadas.length > 0 && <p className="text-xs text-gray-600 mt-1">{fotosSeleccionadas.length} imagen(es) seleccionada(s)</p>}
                            </div>

                            {/* PREVISUALIZACIONES */}
                            {previews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {previews.map((preview, idx) => (
                                        <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-100">
                                            <img src={preview} alt={`Preview ${idx}`} className="w-full h-20 object-cover" />
                                            <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">{idx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* OTROS CAMPOS */}
                            <input type="text" placeholder="Título del producto" required value={formProducto.titulo} onChange={e => setFormProducto({...formProducto, titulo: e.target.value})} disabled={subiendo} className="w-full border rounded px-3 py-2 disabled:opacity-50" />
                            <input type="number" placeholder="Precio (COP)" required min="1" value={formProducto.precio} onChange={e => setFormProducto({...formProducto, precio: e.target.value})} disabled={subiendo} className="w-full border rounded px-3 py-2 disabled:opacity-50" />
                            <input type="number" placeholder="Cantidad disponible" required min="1" value={formProducto.cantidad_disponible} onChange={e => setFormProducto({...formProducto, cantidad_disponible: e.target.value})} disabled={subiendo} className="w-full border rounded px-3 py-2 disabled:opacity-50" />
                            <textarea placeholder="Descripción del producto" required value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})} disabled={subiendo} className="w-full border rounded px-3 py-2 disabled:opacity-50" rows="3"></textarea>
                            
                            <select required value={formProducto.id_categoria} onChange={e => setFormProducto({...formProducto, id_categoria: e.target.value})} disabled={subiendo} className="w-full border rounded px-3 py-2 bg-white disabled:opacity-50">
                                <option value="">Selecciona una categoría</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
                            </select>

                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => { setMostrarModalProducto(false); setFotosSeleccionadas([]); setPreviews([]); }} disabled={subiendo} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                                <button type="submit" disabled={subiendo} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    {subiendo ? '⏳ Publicando...' : 'Publicar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL PRODUCTOS PAUSADOS --- */}
            {mostrarModalPausados && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Productos Desactivados</h2>
                            <button onClick={() => setMostrarModalPausados(false)} className="text-gray-500 hover:text-red-500 font-bold text-2xl">&times;</button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                            {productos.filter(p => p.estado_producto !== 'activo').length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No tienes productos pausados.</p>
                            ) : (
                                productos.filter(p => p.estado_producto !== 'activo').map(p => (
                                    <div key={p.id_producto} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {obtenerImagenUrl(p.fotos) ? (
                                                <img src={obtenerImagenUrl(p.fotos)} alt={p.titulo} className="w-16 h-16 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">Sin foto</div>
                                            )}
                                            <div>
                                                <p className="font-bold text-lg">{p.titulo}</p>
                                                <p className="text-sm text-gray-500">ID: {p.id_producto}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {p.estado_producto === 'pausado' ? (
                                                <button onClick={() => handleReactivarProducto(p.id_producto)} disabled={procesandoID === p.id_producto} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50">
                                                    <FaPlay /> Reactivar
                                                </button>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                                    Bloqueado por Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL EDITAR PRODUCTO --- */}
            {mostrarModalEditar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl my-8">
                        <h2 className="text-2xl font-bold mb-4">Editar Producto</h2>
                        <form onSubmit={handleGuardarEdicion} className="space-y-4">
                            
                            {/* NUEVO: Campo de Foto */}
                            <div>
                                <label className="block text-sm font-bold mb-1">Foto del Producto</label>
                                <div className="flex items-center gap-4">
                                    {previewEdicion ? (
                                        <img src={previewEdicion} alt="Preview" className="w-16 h-16 rounded-lg object-cover border shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500 shadow-sm">Sin foto</div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => { 
                                            if(e.target.files[0]) { 
                                                setFotoEdicion(e.target.files[0]); 
                                                setPreviewEdicion(URL.createObjectURL(e.target.files[0])); 
                                            } 
                                        }} 
                                        disabled={guardandoEdicion}
                                        className="flex-1 border rounded px-3 py-2 text-sm bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Título</label>
                                <input type="text" required value={formEditar.titulo} onChange={e => setFormEditar({...formEditar, titulo: e.target.value})} disabled={guardandoEdicion} className="w-full border rounded px-3 py-2 disabled:opacity-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Precio (COP)</label>
                                <input type="number" required min="1" value={formEditar.precio} onChange={e => setFormEditar({...formEditar, precio: e.target.value})} disabled={guardandoEdicion} className="w-full border rounded px-3 py-2 disabled:opacity-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Descripción</label>
                                <textarea required value={formEditar.descripcion} onChange={e => setFormEditar({...formEditar, descripcion: e.target.value})} disabled={guardandoEdicion} className="w-full border rounded px-3 py-2 disabled:opacity-50" rows="4"></textarea>
                            </div>
                            <div className="flex gap-2 mt-6 pt-4 border-t">
                                <button type="button" onClick={() => setMostrarModalEditar(false)} disabled={guardandoEdicion} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={guardandoEdicion} className="flex-1 bg-yellow-500 text-white py-2 rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-md disabled:opacity-50">{guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL EDITAR PERFIL --- */}
            {mostrarModalPerfil && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
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
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => { if(e.target.files[0]) { setFotoPerfil(e.target.files[0]); setPreviewPerfil(URL.createObjectURL(e.target.files[0])); } }} 
                                        disabled={subiendoPerfil}
                                        className="flex-1 border rounded px-3 py-2 text-sm bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Especialidad</label>
                                <input type="text" placeholder="Ej. Cerámica, Madera, Textiles..." value={formPerfil.especialidad} onChange={e => setFormPerfil({...formPerfil, especialidad: e.target.value})} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Años de experiencia</label>
                                <input type="number" min="0" value={formPerfil.años_experiencia} onChange={e => setFormPerfil({...formPerfil, años_experiencia: e.target.value})} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Descripción de tu taller</label>
                                <textarea placeholder="Cuéntale a los compradores sobre ti y tu trabajo..." value={formPerfil.descripcion} onChange={e => setFormPerfil({...formPerfil, descripcion: e.target.value})} className="w-full border rounded px-3 py-2" rows="4"></textarea>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => { setMostrarModalPerfil(false); setFotoPerfil(null); setPreviewPerfil(formPerfil.foto_perfil_url || ''); }} disabled={subiendoPerfil} className="flex-1 border-2 border-gray-300 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={subiendoPerfil} className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 shadow-md disabled:opacity-50">
                                    {subiendoPerfil ? '⏳ Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL PARA CALIFICAR COMPRA --- */}
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
        </div>
    );
};

export default DashboardArtesano;