import { Navigate } from 'react-router-dom';
import authStore from '../store/authStore';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, usuario } = authStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (roles.length > 0 && !roles.includes(usuario?.tipo_usuario)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
