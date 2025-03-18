import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);

  // Configurar el token en los headers de axios y el interceptor para renovación automática
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }

    // Configurar interceptor para manejar errores de autenticación
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        // Si el error es 401 (no autorizado) y tenemos un token, intentar renovarlo
        if (error.response && error.response.status === 401 && token && !tokenRefreshing) {
          setTokenRefreshing(true);
          
          try {
            // Intentar renovar el token
            const res = await axios.post('/api/auth/refresh', { token }, {
              headers: { 'x-auth-token': null } // No enviar el token expirado
            });
            
            // Actualizar el token
            const newToken = res.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            
            // Reintentar la petición original con el nuevo token
            const originalRequest = error.config;
            originalRequest.headers['x-auth-token'] = newToken;
            return axios(originalRequest);
          } catch (refreshError) {
            // Si no se puede renovar el token, cerrar sesión
            console.error('Error al renovar el token:', refreshError);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            return Promise.reject(error);
          } finally {
            setTokenRefreshing(false);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Limpiar interceptor al desmontar
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, tokenRefreshing]);

  // Cargar usuario si hay token
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setError(err.response?.data?.msg || 'Error de autenticación');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al iniciar sesión');
      throw err;
    }
  };

  // Registrar usuario
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/users', userData);
      // Si es superadmin, inicia sesión automáticamente
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setIsAuthenticated(true);
      }
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrarse');
      throw err;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      if (isAuthenticated) {
        await axios.post('/api/auth/logout');
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Limpiar errores
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};