import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showPendingTab, setShowPendingTab] = useState(false);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Cargar todos los usuarios
        const res = await axios.get('/api/users');
        setUsers(res.data);

        // Cargar usuarios pendientes
        const pendingRes = await axios.get('/api/users/pending');
        setPendingUsers(pendingRes.data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('Error al cargar usuarios. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterRole === '' || user.role === filterRole) &&
      (filterStatus === '' || user.status === filterStatus)
    );
  });

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = showPendingTab 
    ? pendingUsers.slice(indexOfFirstUser, indexOfLastUser)
    : filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(
    (showPendingTab ? pendingUsers.length : filteredUsers.length) / usersPerPage
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Aprobar o rechazar usuario
  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await axios.put(`/api/users/${userId}/status`, { status });
      
      // Actualizar listas de usuarios
      const res = await axios.get('/api/users');
      setUsers(res.data);
      
      const pendingRes = await axios.get('/api/users/pending');
      setPendingUsers(pendingRes.data);
    } catch (err) {
      console.error(`Error al ${status === 'active' ? 'aprobar' : 'rechazar'} usuario:`, err);
      setError(`Error al ${status === 'active' ? 'aprobar' : 'rechazar'} usuario. Por favor, intenta de nuevo.`);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Traducir rol de usuario
  const translateUserRole = (role) => {
    const roles = {
      'superadmin': 'Super Administrador',
      'admin': 'Administrador',
      'instructor': 'Instructor'
    };
    return roles[role] || role;
  };

  // Traducir estado de usuario
  const translateUserStatus = (status) => {
    const statuses = {
      'pending': 'Pendiente',
      'active': 'Activo',
      'rejected': 'Rechazado'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setShowPendingTab(false);
              setCurrentPage(1);
            }}
            className={`${!showPendingTab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Todos los Usuarios
          </button>
          <button
            onClick={() => {
              setShowPendingTab(true);
              setCurrentPage(1);
            }}
            className={`${showPendingTab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pendientes de Aprobación
            {pendingUsers.length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Filtros (solo mostrar en la pestaña de todos los usuarios) */}
      {!showPendingTab && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="superadmin">Super Administrador</option>
                <option value="admin">Administrador</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="active">Activo</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              {showPendingTab && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.length > 0 ? (
              currentUsers.map((userItem) => (
                <tr key={userItem._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{userItem.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {translateUserRole(userItem.role)}
                      {userItem.role === 'admin' && userItem.area && (
                        <span className="ml-1 text-xs text-gray-400">({userItem.area})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${userItem.status === 'active' ? 'bg-green-100 text-green-800' : 
                        userItem.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {translateUserStatus(userItem.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(userItem.createdAt)}
                  </td>
                  {showPendingTab && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateUserStatus(userItem._id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleUpdateUserStatus(userItem._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showPendingTab ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay usuarios {showPendingTab ? 'pendientes' : ''} disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            {[...Array(totalPages).keys()].map(number => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === number + 1 ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {number + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Users;