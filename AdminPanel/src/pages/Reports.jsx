import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: 'general',
    data: {},
    format: 'excel'
  });

  // Cargar reportes
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports');
        setReports(res.data);
      } catch (err) {
        console.error('Error al cargar reportes:', err);
        setError('Error al cargar reportes. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    return (
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === '' || report.type === filterType) &&
      (filterFormat === '' || report.format === filterFormat)
    );
  });

  // Paginación
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport({ ...newReport, [name]: value });
  };

  // Crear nuevo reporte
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Para simplificar, establecemos datos de ejemplo según el tipo
      let reportData = {};
      
      switch(newReport.type) {
        case 'activity':
          reportData = { activityIds: [], startDate: new Date(), endDate: new Date() };
          break;
        case 'instructor':
          reportData = { instructorIds: [], metrics: ['activities', 'guides'] };
          break;
        case 'event':
          reportData = { eventIds: [], includeAttendance: true };
          break;
        default:
          reportData = { includeAll: true, period: 'monthly' };
      }
      
      const reportToSubmit = {
        ...newReport,
        data: reportData
      };
      
      await axios.post('/api/reports', reportToSubmit);
      const res = await axios.get('/api/reports');
      setReports(res.data);
      setShowAddModal(false);
      setNewReport({
        title: '',
        description: '',
        type: 'general',
        data: {},
        format: 'excel'
      });
    } catch (err) {
      console.error('Error al crear reporte:', err);
      setError('Error al crear reporte. Por favor, intenta de nuevo.');
    }
  };

  // Eliminar reporte
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      try {
        await axios.delete(`/api/reports/${id}`);
        setReports(reports.filter(report => report._id !== id));
      } catch (err) {
        console.error('Error al eliminar reporte:', err);
        setError('Error al eliminar reporte. Por favor, intenta de nuevo.');
      }
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Traducir tipo de reporte
  const translateReportType = (type) => {
    const types = {
      'activity': 'Actividades',
      'instructor': 'Instructores',
      'event': 'Eventos',
      'general': 'General'
    };
    return types[type] || type;
  };

  // Traducir formato de reporte
  const translateReportFormat = (format) => {
    const formats = {
      'excel': 'Excel',
      'pdf': 'PDF',
      'csv': 'CSV'
    };
    return formats[format] || format;
  };

  // Traducir estado de reporte
  const translateReportStatus = (status) => {
    const statuses = {
      'pending': 'Pendiente',
      'generated': 'Generado',
      'error': 'Error'
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
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Nuevo Reporte
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="activity">Actividades</option>
              <option value="instructor">Instructores</option>
              <option value="event">Eventos</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Formato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReports.length > 0 ? (
              currentReports.map((report) => (
                <tr key={report._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.title}</div>
                    <div className="text-sm text-gray-500">{report.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {translateReportType(report.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {translateReportFormat(report.format)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={
                      `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'generated' ? 'bg-green-100 text-green-800' :
                        report.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`
                    }>
                      {translateReportStatus(report.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {report.status === 'generated' && report.downloadUrl && (
                        <a
                          href={report.downloadUrl}
                          className="text-indigo-600 hover:text-indigo-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Descargar
                        </a>
                      )}
                      {user.role === 'superadmin' && (
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay reportes disponibles
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

      {/* Modal para crear nuevo reporte */}
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      name="title"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Título del reporte"
                      value={newReport.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="description"
                      rows="3"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Descripción del reporte"
                      value={newReport.description}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      name="type"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      value={newReport.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="general">General</option>
                      <option value="activity">Actividades</option>
                      <option value="instructor">Instructores</option>
                      <option value="event">Eventos</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                    <select
                      name="format"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      value={newReport.format}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;