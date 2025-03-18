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
    <div>
      {/* Aquí va el contenido principal de la página */}
      
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
