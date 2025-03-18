import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-primary-600 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Página no encontrada</h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition duration-300"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;