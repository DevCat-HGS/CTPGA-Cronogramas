import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotification();
  const [formData, setFormData] = useState({
    email: preferences.email,
    push: preferences.push,
    inApp: preferences.inApp
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePreferences(formData);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Preferencias de Notificaciones</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="email"
                name="email"
                type="checkbox"
                checked={formData.email}
                onChange={handleChange}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="email" className="font-medium text-gray-700">Correo electrónico</label>
              <p className="text-gray-500">Recibir notificaciones por correo electrónico</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="push"
                name="push"
                type="checkbox"
                checked={formData.push}
                onChange={handleChange}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="push" className="font-medium text-gray-700">Notificaciones push</label>
              <p className="text-gray-500">Recibir notificaciones push en el navegador</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="inApp"
                name="inApp"
                type="checkbox"
                checked={formData.inApp}
                onChange={handleChange}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="inApp" className="font-medium text-gray-700">En la aplicación</label>
              <p className="text-gray-500">Recibir notificaciones dentro de la aplicación</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Guardar preferencias
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences;