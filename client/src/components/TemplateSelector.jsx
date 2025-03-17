import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TemplateSelector = ({ type, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/templates');
        // Filtrar por tipo si se especifica
        const filteredTemplates = type 
          ? res.data.filter(template => template.type === type)
          : res.data;
        setTemplates(filteredTemplates);
      } catch (err) {
        console.error('Error al cargar plantillas:', err);
        setError('Error al cargar plantillas. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [type]);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    if (onSelect) {
      onSelect(template);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">Cargando plantillas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No hay plantillas disponibles para este tipo de contenido.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Plantilla</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div 
            key={template._id}
            onClick={() => handleSelect(template)}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedTemplate?._id === template._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
          >
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            {template.isDefault && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                Predeterminada
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;