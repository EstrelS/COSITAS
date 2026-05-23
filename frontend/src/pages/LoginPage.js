import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import authStore from '../store/authStore';
import CryptoJS from 'crypto-js'; // <-- PASO 1: Importamos CryptoJS

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUsuario = authStore((state) => state.setUsuario);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // <-- PASO 2: Encriptamos la contraseña usando la clave secreta (CORREGIDO PARA CREATE REACT APP)
      const claveSecreta = process.env.REACT_APP_AES_SECRET_KEY || 'MiClaveSecretaSuperSegura2026';
      const passwordEncriptado = CryptoJS.AES.encrypt(password, claveSecreta).toString();

      // <-- PASO 3: Enviamos la contraseña encriptada al backend
      const response = await axiosInstance.post('/auth/login', {
        email,
        password: passwordEncriptado 
      });

      localStorage.setItem('token', response.data.token);
      setUsuario(response.data.usuario, response.data.token);
      
      // Alerta nativa que no rompe el flujo
      alert('¡Bienvenido!');

      if (response.data.usuario.tipo_usuario === 'comprador') {
        navigate('/dashboard/comprador');
      } else if (response.data.usuario.tipo_usuario === 'artesano') {
        navigate('/dashboard/artesano');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Error completo en login:', err);
      // Alerta nativa para ver el error real en pantalla
      alert(err.response?.data?.message || 'Error al iniciar sesión. Verifica el backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="card w-96">
        <h2 className="text-3xl font-bold text-center mb-8">Iniciar Sesión</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center mt-4">
          ¿No tienes cuenta? <Link to="/registro" className="text-blue-600 font-bold">Registrarse</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;