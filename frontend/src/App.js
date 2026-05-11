import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import authStore from './store/authStore';

// Páginas
import CarritoCompras from './pages/CarritoCompras';
import ChatPage from './pages/ChatPage';
import DashboardArtesano from './pages/DashboardArtesano';
import DashboardComprador from './pages/DashboardComprador';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PanelAdmin from './pages/PanelAdmin';
import PerfilArtesano from './pages/PerfilArtesano';
import ProductoDetalle from './pages/ProductoDetalle';
import RegistroPage from './pages/RegistroPage';

// Componentes
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const checkAuth = authStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Navbar />
      <Toaster position="top-right" />
      <div className="site-main">
        <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
        <Route path="/artesano/:id" element={<PerfilArtesano />} />

        {/* Rutas protegidas - Comprador */}
        <Route
          path="/dashboard/comprador"
          element={<ProtectedRoute roles={['comprador']}><DashboardComprador /></ProtectedRoute>}
        />
        <Route
          path="/carrito"
          element={<ProtectedRoute roles={['comprador']}><CarritoCompras /></ProtectedRoute>}
        />
        <Route
          path="/chat/:id_conversacion"
          element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
        />

        {/* Rutas protegidas - Artesano */}
        <Route
          path="/dashboard/artesano"
          element={<ProtectedRoute roles={['artesano']}><DashboardArtesano /></ProtectedRoute>}
        />

        {/* Rutas protegidas - Admin */}
        <Route
          path="/admin"
          element={<ProtectedRoute roles={['administrador']}><PanelAdmin /></ProtectedRoute>}
        />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
