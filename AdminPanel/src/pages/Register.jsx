import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'instructor',
    area: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, password2, role, area } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
    if (error) clearError();
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (password !== password2) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    // Validar que se proporcione el área si es admin
    if (role === 'admin' && !area) {
      setErrorMessage('El área es requerida para administradores');
      return;
    }

    setLoading(true);
    
    try {
      const userData = { name, email, password, role };
      if (role === 'admin') {
        userData.area = area;
      }

      const res = await register(userData);
      
      // Si es superadmin, redirigir al dashboard
      if (res.token) {
        navigate('/dashboard');
      } else {
        // Para otros roles, mostrar mensaje de éxito
        setSuccessMessage('Solicitud de registro enviada. Pendiente de aprobación.');
        setFormData({
          name: '',
          email: '',
          password: '',
          password2: '',
          role: 'instructor',
          area: ''
        });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">CTPGA Manager</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Regístrate para acceder a la plataforma
          </p>
        </div>
        
        {successMessage ? (
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Nombre completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={onChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={onChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={onChange}
                />
              </div>
              <div>
                <label htmlFor="password2" className="sr-only">Confirmar contraseña</label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmar contraseña"
                  value={password2}
                  onChange={onChange}
                />
              </div>
              <div>
                <label htmlFor="role" className="sr-only">Rol</label>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  value={role}
                  onChange={onChange}
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrador</option>
                  <option value="superadmin">Super Administrador</option>
                </select>
              </div>
              {role === 'admin' && (
                <div>
                  <label htmlFor="area" className="sr-only">Área</label>
                  <input
                    id="area"
                    name="area"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Área (requerido para administradores)"
                    value={area}
                    onChange={onChange}
                  />
                </div>
              )}
            </div>

            {(errorMessage || error) && (
              <div className="text-red-500 text-sm text-center">
                {errorMessage || error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>

            <div className="text-sm text-center">
              <p>¿Ya tienes una cuenta?</p>
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;