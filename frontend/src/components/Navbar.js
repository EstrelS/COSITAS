import { useState, useEffect } from 'react';
import { FaChevronDown, FaShoppingCart, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import authStore from '../store/authStore';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, usuario, logout, checkAuth } = authStore();
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        checkAuth(); // Asegura que el usuario esté cargado al montar el componente
    }, [checkAuth]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
    };

    // Lógica robusta de redirección
    const getDashboardPath = () => {
        if (!usuario) return '/';
        if (usuario.tipo_usuario === 'administrador') return '/admin';
        if (usuario.tipo_usuario === 'artesano') return '/dashboard/artesano';
        return '/dashboard/comprador';
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
                    <Link to="/">Inicio</Link>
                    <Link to="/productos">Productos</Link>
                    <Link to="/para-ti">Para ti</Link>
                </nav>

                <div className="nav-right">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="btn-login">Iniciar sesión</Link>
                            <Link to="/registro" className="btn-register">Registrarse</Link>
                        </>
                    ) : (
                        <>
                            {usuario?.tipo_usuario !== 'administrador' && (
                                <Link to="/carrito" style={{ color: '#374151', fontSize: '1.25rem' }} title="Carrito">
                                    <FaShoppingCart />
                                </Link>
                            )}
                            <div className={`dropdown ${showDropdown ? 'open' : ''}`}>
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151' }}
                                >
                                    <FaUser size={16} />
                                    <span>{usuario?.nombre?.split(' ')[0]}</span>
                                    <FaChevronDown size={12} />
                                </button>
                                <div className="dropdown-menu">
                                    <Link to={getDashboardPath()} onClick={() => setShowDropdown(false)}>Mi Perfil</Link>
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