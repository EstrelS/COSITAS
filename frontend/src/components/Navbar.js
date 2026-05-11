import { useState } from 'react';
import { FaChevronDown, FaShoppingCart, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import authStore from '../store/authStore';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, usuario, logout } = authStore();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
    };

    return (
        <header>
            <div className="nav-wrapper">
                <Link to="/" className="logo">
                    <img src="/assets/cositas-logo.jpeg" alt="COSITAS Logo" className="logo-image" />
                    <div className="logo-text">
                        <h1>COSITAS</h1>
                        <span>Artesanías Handmade</span>
                    </div>
                </Link>

                <nav>
                    <a href="/">Inicio</a>
                    <a href="/">Productos</a>
                    <a href="/">Categorías</a>
                </nav>

                <div className="nav-right">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="btn-login">Iniciar sesión</Link>
                            <Link to="/registro" className="btn-register">Registrarse</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/carrito" style={{ color: '#374151', fontSize: '1.25rem' }} title="Carrito">
                                <FaShoppingCart />
                            </Link>
                            <div className={`dropdown ${showDropdown ? 'open' : ''}`}>
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151' }}
                                >
                                    <FaUser size={16} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500', display: 'none' }}>
                                        {usuario?.nombre?.split(' ')[0]}
                                    </span>
                                    <FaChevronDown size={12} />
                                </button>
                                <div className="dropdown-menu">
                                    <Link to="/perfil">Mi Perfil</Link>
                                    <Link to="/mis-compras">Mis Compras</Link>
                                    <button onClick={handleLogout}>Cerrar sesión</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
