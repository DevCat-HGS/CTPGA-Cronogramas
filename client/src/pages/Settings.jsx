import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationPreferences from '../components/NotificationPreferences';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Configuración
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Perfil de Usuario</h3>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <div className="mt-1 text-sm text-gray-900">{user?.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <div className="mt-1 text-sm text-gray-900">{user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <div className="mt-1 text-sm text-gray-900">
                  {user?.role === 'superadmin' ? 'Super Administrador' : 
                   user?.role === 'admin' ? `Administrador - ${user?.area}` : 
                   'Instructor'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
          <NotificationPreferences />
        </div>
      </div>
    </div>
  );
};

export default Settings;