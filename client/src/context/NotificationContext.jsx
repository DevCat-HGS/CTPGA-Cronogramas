import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    inApp: true
  });

  // Conectar al socket cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      // Inicializar socket
      const newSocket = io('', { path: '/socket.io' });
      setSocket(newSocket);

      // Unirse a la sala según el rol del usuario
      newSocket.emit('joinRoom', user.role);
      
      // Si es admin, unirse también a su área específica
      if (user.role === 'admin' && user.area) {
        newSocket.emit('joinRoom', `area-${user.area}`);
      }

      // Unirse a la sala personal del usuario
      newSocket.emit('joinRoom', `user-${user._id}`);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Escuchar notificaciones
  useEffect(() => {
    if (socket) {
      socket.on('notification', (message) => {
        if (preferences.inApp) {
          // Añadir la notificación a la lista
          setNotifications(prev => [{
            id: Date.now(),
            message,
            read: false,
            timestamp: new Date()
          }, ...prev]);
        }
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, preferences.inApp]);

  // Marcar notificación como leída
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Eliminar notificación
  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Actualizar preferencias de notificación
  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    // Aquí se podría hacer una llamada a la API para guardar las preferencias en la base de datos
  };

  // Enviar notificación (para uso interno de la aplicación)
  const sendNotification = (room, message) => {
    if (socket) {
      socket.emit('notification', { room, message });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        preferences,
        markAsRead,
        markAllAsRead,
        removeNotification,
        updatePreferences,
        sendNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};