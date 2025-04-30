import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Users, FileText, Calendar, Clock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Mock data for demonstration
  const stats = [
    { name: 'Instructores', value: '24', icon: Users, change: '+4', changeType: 'increase' },
    { name: 'Guías', value: '156', icon: FileText, change: '+12', changeType: 'increase' },
    { name: 'Eventos', value: '8', icon: Calendar, change: '+2', changeType: 'increase' },
    { name: 'Pendientes', value: '3', icon: Clock, change: '-1', changeType: 'decrease' },
  ];
  
  const recentRequests = [
    { id: '1', name: 'Carlos Martínez', email: 'cmartinez@example.com', area: 'Desarrollo Web', date: '2025-04-15' },
    { id: '2', name: 'Laura Gómez', email: 'lgomez@example.com', area: 'Electrónica', date: '2025-04-14' },
    { id: '3', name: 'Miguel Ángel Rodríguez', email: 'mrodriguez@example.com', area: 'Mecatrónica', date: '2025-04-12' },
  ];
  
  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Administrativo</h1>
            <p className="mt-2 text-sm text-gray-700">
              Vista general de instructores, guías, y solicitudes pendientes.
            </p>
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
        
        <div className="mt-8">
          <Card title="Solicitudes de Registro Recientes">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Área
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
                  {recentRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Aprobar
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Instructores Activos">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Gráfico de Instructores Activos
            </div>
          </Card>
          <Card title="Actividad Reciente">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Timeline de Actividad
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};