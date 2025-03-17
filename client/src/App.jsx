import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Guides from './pages/Guides';
import Events from './pages/Events';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Componente para rutas protegidas
const PrivateRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Si hay roles permitidos y el usuario no tiene el rol adecuado
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return element;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas dentro del layout principal */}
      <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="activities" element={<Activities />} />
        <Route path="guides" element={<Guides />} />
        <Route path="events" element={<Events />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Rutas solo para admin y superadmin */}
        <Route 
          path="reports" 
          element={
            <PrivateRoute 
              element={<Reports />} 
              allowedRoles={['admin', 'superadmin']} 
            />
          } 
        />
        
        {/* Rutas solo para admin y superadmin */}
        <Route 
          path="users" 
          element={
            <PrivateRoute 
              element={<Users />} 
              allowedRoles={['admin', 'superadmin']} 
            />
          } 
        />
      </Route>
      
      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;