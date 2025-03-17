import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';

const NotificationComponent = () => {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Formatear fecha
  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else if (diffHours < 24) {
      return `${diffHours} h`;
    } else {
      return `${diffDays} d`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full bg-primary-700 p-1 text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800"
      >
        <span className="absolute -inset-1.5" />
        <span className="sr-only">Ver notificaciones</span>
        {unreadCount > 0 ? (
          <>
            <BellAlertIcon className="h-6 w-6" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-primary-600 hover:text-primary-500"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notification.timestamp)}</p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary-600 hover:text-primary-500"
                        >
                          Marcar como leída
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;