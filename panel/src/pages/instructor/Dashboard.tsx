import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { FileText, BookOpen, Calendar, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const InstructorDashboard: React.FC = () => {
  // Mock data for demonstration
  const stats = [
    { name: 'Mis Guías', value: '8', icon: BookOpen, change: '+2', changeType: 'increase' },
    { name: 'Actividades', value: '15', icon: FileText, change: '+4', changeType: 'increase' },
    { name: 'Eventos', value: '3', icon: Calendar, change: '+1', changeType: 'increase' },
    { name: 'Calificación', value: '4.8', icon: Star, change: '+0.2', changeType: 'increase' },
  ];
  
  const recentGuides = [
    { id: '1', title: 'Introducción a la Programación Web', status: 'Publicada', date: '2025-04-10' },
    { id: '2', title: 'Fundamentos de HTML y CSS', status: 'Borrador', date: '2025-04-12' },
    { id: '3', title: 'Desarrollo de APIs RESTful', status: 'Publicada', date: '2025-03-28' },
  ];
  
  const upcomingEvents = [
    { id: '1', title: 'Taller de Desarrollo Ágil', date: '2025-04-20', time: '10:00 - 12:00' },
    { id: '2', title: 'Conferencia de Tecnologías Emergentes', date: '2025-04-25', time: '14:00 - 16:00' },
  ];
  
  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Panel del Instructor</h1>
            <p className="mt-2 text-sm text-gray-700">
              Bienvenido a tu panel de control. Aquí puedes gestionar tus guías y actividades.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="primary"
              icon={<FileText className="h-4 w-4" />}
            >
              Nueva Guía
            </Button>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="overflow-hidden">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Guías Recientes">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentGuides.map((guide) => (
                    <tr key={guide.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {guide.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guide.status === 'Publicada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guide.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guide.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Editar
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card title="Próximos Eventos">
            <div className="divide-y divide-gray-200">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {event.time}
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card title="Progreso de Actividades">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Gráfico de Progreso
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};