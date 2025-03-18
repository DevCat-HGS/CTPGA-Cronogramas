import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Guides = () => {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [guidesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Cargar guías
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        let url = '/api/guides';
        
        // Si es instructor, solo mostrar sus guías
        if (user.role === 'instructor') {
          url += `/instructor/${user.id}`;
        }
        
        const res = await axios.get(url);
        setGuides(res.data);
      } catch (err) {
        console.error('Error al cargar guías:', err);
        setError('Error al cargar guías. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, [user.id, user.role]);

  // Filtrar guías
  const filteredGuides = guides.filter(guide => {
    return (
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === '' || guide.category === filterCategory) &&
      (filterStatus === '' || guide.status === filterStatus)
    );
  });

  // Paginación
  const indexOfLastGuide = currentPage * guidesPerPage;
  const indexOfFirstGuide = indexOfLastGuide - guidesPerPage;
  const currentGuides = filteredGuides.slice(indexOfFirstGuide, indexOfLastGuide);
  const totalPages = Math.ceil(filteredGuides.length / guidesPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Ver versiones de una guía
  const handleViewVersions = async (guideId) => {
    setLoadingVersions(true);
    setSelectedGuide(guides.find(g => g._id === guideId));
    setShowVersionModal(true);
    
    try {
      const res = await axios.get(`/api/guide-versions/${guideId}`);
      setVersions(res.data);
    } catch (err) {
      console.error('Error al cargar versiones:', err);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Aprobar o rechazar una guía
  const handleApproveGuide = async (guideId, status) => {
    try {
      await axios.put(`/api/guides/${guideId}/status`, { status });
      
      // Actualizar la lista de guías
      const updatedGuides = guides.map(guide => 
        guide._id === guideId ? { ...guide, status } : guide
      );
      
      setGuides(updatedGuides);
    } catch (err) {
      console.error(`Error al ${status === 'approved' ? 'aprobar' : 'rechazar'} guía:`, err);
      setError(`Error al ${status === 'approved' ? 'aprobar' : 'rechazar'} guía. Por favor, intenta de nuevo.`);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Guías de Estudio</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por título..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="matematicas">Matemáticas</option>
              <option value="ciencias">Ciencias</option>
              <option value="lenguaje">Lenguaje</option>
              <option value="historia">Historia</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tabla de guías */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {currentGuides.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentGuides.map((guide) => (
                  <tr key={guide._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{guide.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{guide.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{guide.author?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(guide.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${guide.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${guide.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${guide.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {guide.status === 'approved' && 'Aprobado'}
                        {guide.status === 'pending' && 'Pendiente'}
                        {guide.status === 'rejected' && 'Rechazado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewVersions(guide._id)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Ver versiones
                      </button>
                      
                      {user.role === 'admin' && guide.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveGuide(guide._id, 'approved')}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleApproveGuide(guide._id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No se encontraron guías con los filtros seleccionados
          </div>
        )}
        
        {/* Paginación */}
        {filteredGuides.length > guidesPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstGuide + 1}</span> a <span className="font-medium">
                    {Math.min(indexOfLastGuide, filteredGuides.length)}
                  </span> de <span className="font-medium">{filteredGuides.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === number + 1 ? 'z-10 bg-primary-50 border-primary-500 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      {number + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal para ver versiones */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Versiones de {selectedGuide?.title}
              </h2>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loadingVersions ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : versions.length > 0 ? (
              <div className="mt-4">
                <ul className="divide-y divide-gray-200">
                  {versions.map((version) => (
                    <li key={version._id} className="py-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Versión {version.versionNumber}</p>
                          <p className="text-sm text-gray-500">{formatDate(version.createdAt)}</p>
                        </div>
                        <a
                          href={version.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Descargar
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No hay versiones disponibles</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Guides;
