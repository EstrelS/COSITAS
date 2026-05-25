import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

const RegistroPage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo_usuario, setTipo_usuario] = useState('comprador');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/auth/registro', {
        nombre,
        email,
        password,
        tipo_usuario
      });

      toast.success('¡Cuenta creada! Inicia sesión ahora');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data?.errors || [err.response?.data?.message];
      errors.forEach(error => toast.error(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="card w-96">
        <h2 className="text-3xl font-bold text-center mb-8">Crear Cuenta</h2>

        <form onSubmit={handleRegistro} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input-field"
            required
          />

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

          <select
            value={tipo_usuario}
            onChange={(e) => setTipo_usuario(e.target.value)}
            className="input-field"
          >
            <option value="comprador">Soy Comprador</option>
            <option value="artesano">Soy Artesano</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center mt-4">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegistroPage;
