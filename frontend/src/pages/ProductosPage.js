import { useEffect, useState } from 'react';
import { FaSearch, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

const ProductosPage = () => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, [busqueda, categoria]);

    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/productos', {
                params: { busqueda, categoria }
            });
            setProductos(response.data.productos || []);
        } catch (err) {
            console.error('Error fetching productos:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await axiosInstance.get('/categorias');
            setCategorias(response.data.categorias || []);
        } catch (err) {
            console.error('Error fetching categorias:', err);
        }
    };

    const handleBusqueda = (e) => {
        setBusqueda(e.target.value);
    };

    const obtenerImagenUrl = (fotos) => {
        if (!fotos) return '';
        if (typeof fotos === 'string') {
            if (fotos.startsWith('[') && fotos.endsWith(']')) {
                try {
                    const parseado = JSON.parse(fotos);
                    return parseado[0] || '';
                } catch (e) {
                    return fotos;
                }
            }
            return fotos;
        }
        if (Array.isArray(fotos)) {
            return fotos[0] || '';
        }
        return '';
    };

    return (
        <div className="productos-page py-8">
            <div className="container">
                <section className="search-section">
                    <div className="search-box">
                        <div className="search-box-inner">
                            <div className="search-input-wrapper">
                                <label>Buscar productos</label>
                                <div className="search-input-container">
                                    <FaSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, material o artesano..."
                                        value={busqueda}
                                        onChange={handleBusqueda}
                                        className="search-input"
                                    />
                                </div>
                            </div>
                            <div className="search-select-wrapper">
                                <label>Categoría</label>
                                <select 
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    className="search-select"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id_categoria} value={cat.id_categoria}>
                                            {cat.nombre_categoria}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="main-content mt-8">
                    <div className="filters-section">
                        <h2>Filtrar por categoría</h2>
                        <div className="filters-grid">
                            <button
                                onClick={() => setCategoria('')}
                                className={`filter-btn ${categoria === '' ? 'active' : ''}`}
                            >
                                Todas
                            </button>
                            {categorias.map((cat) => (
                                <button
                                    key={cat.id_categoria}
                                    onClick={() => setCategoria(cat.id_categoria)}
                                    className={`filter-btn ${categoria === cat.id_categoria ? 'active' : ''}`}
                                >
                                    {cat.nombre_categoria}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : productos.length > 0 ? (
                        <div>
                            <h2 className="products-title">
                                {busqueda ? `Resultados para "${busqueda}"` : 'Productos Disponibles'}
                            </h2>
                            <div className="product-grid">
                                {productos.map((producto) => (
                                    <Link 
                                        key={producto.id_producto} 
                                        to={`/productos/${producto.id_producto}`}
                                        className="product-card-link"
                                    >
                                        <div className="product-card">
                                            <div className="product-image-wrapper">
                                                {obtenerImagenUrl(producto.fotos) ? (
                                                    <img 
                                                        src={obtenerImagenUrl(producto.fotos)} 
                                                        alt={producto.titulo} 
                                                        className="product-image"
                                                    />
                                                ) : (
                                                    <div className="product-image-placeholder">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            <div className="product-info">
                                                <h3 className="product-name">
                                                    {producto.titulo}
                                                </h3>
                                                <p className="product-description">
                                                    {producto.descripcion}
                                                </p>
                                                <div className="product-footer">
                                                    <span className="product-price">
                                                        ${producto.precio?.toLocaleString()}
                                                    </span>
                                                    <div className="product-rating">
                                                        <FaStar className="rating-star" />
                                                        <span>
                                                            {producto.calificacion_promedio ? Number(producto.calificacion_promedio).toFixed(1) : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3>No hay productos disponibles</h3>
                            <p>Intenta con otros criterios de búsqueda</p>
                            <button 
                                onClick={() => { setBusqueda(''); setCategoria(''); }}
                                className="empty-state-btn"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProductosPage;