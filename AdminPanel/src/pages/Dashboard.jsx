import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activities: 0,
    guides: 0,
    events: 0,
    pendingUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si el usuario existe antes de continuar
    if (!user) {
      setLoading(false);
      setError('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }

    const fetchStats = async () => {
      try {
        // Obtener estadísticas de actividades
        const activitiesRes = await axios.get('/api/activities');
        
        // Obtener estadísticas de guías
        const guidesRes = await axios.get('/api/guides');
        
        // Obtener estadísticas de eventos
        const eventsRes = await axios.get('/api/events');
        
        // Si es admin o superadmin, obtener usuarios pendientes
        let pendingUsers = 0;
        if (['admin', 'superadmin'].includes(user.role)) {
          const pendingUsersRes = await axios.get('/api/users/pending');
          pendingUsers = pendingUsersRes.data.length;
        }
        
        setStats({
          activities: activitiesRes.data.length,
          guides: guidesRes.data.length,
          events: eventsRes.data.length,
          pendingUsers
        });
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setError('Error al cargar estadísticas. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Bienvenido, {user?.name || 'Usuario'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'superadmin' ? 'Super Administrador' : 
             user?.role === 'admin' ? `Administrador - ${user?.area || ''}` : 
             'Instructor'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta de Actividades */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Actividades</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.activities}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/activities" className="font-medium text-primary-600 hover:text-primary-900">Ver todas</a>
            </div>
          </div>
        </div>

        {/* Tarjeta de Guías */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Guías</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.guides}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/guides" className="font-medium text-secondary-600 hover:text-secondary-900">Ver todas</a>
            </div>
          </div>
        </div>

        {/* Tarjeta de Eventos */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Eventos</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.events}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/events" className="font-medium text-green-600 hover:text-green-900">Ver todos</a>
            </div>
          </div>
        </div>

        {/* Tarjeta de Usuarios Pendientes (solo para admin y superadmin) */}
        {user && ['admin', 'superadmin'].includes(user.role) && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Usuarios Pendientes</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.pendingUsers}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/users" className="font-medium text-yellow-600 hover:text-yellow-900">Gestionar</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección de acciones rápidas */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Acciones rápidas</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Crear nueva actividad</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Crea una nueva actividad para organizar tus guías y contenido.</p>
              </div>
              <div className="mt-3">
                <a
                  href="/activities"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Crear actividad
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Crear nueva guía</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Crea una nueva guía para tus actividades educativas.</p>
              </div>
              <div className="mt-3">
                <a
                  href="/guides"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                >
                  Crear guía
                </a>
              </div>
            </div>
          </div>

          {['admin', 'superadmin'].includes(user.role) && (
            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Programar evento</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Programa un nuevo evento para la institución.</p>
                </div>
                <div className="mt-3">
                  <a
                    href="/events"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Crear evento
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;