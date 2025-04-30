import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  BarChart2, 
  Settings, 
  HelpCircle,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  
  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isInstructor = user?.role === 'instructor' || isAdmin;
  
  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    {
      name: 'Usuarios',
      href: '#',
      icon: Users,
      children: [
        { name: 'Solicitudes', href: '/admin/requests' },
        { name: 'Usuarios Activos', href: '/admin/users' }
      ]
    },
    {
      name: 'Guías y Actividades',
      href: '#',
      icon: FileText,
      children: [
        { name: 'Todas las Guías', href: '/admin/guides' },
        { name: 'Actividades', href: '/admin/activities' }
      ]
    },
    { name: 'Eventos', href: '/admin/events', icon: Calendar },
    { name: 'Reportes', href: '/admin/reports', icon: BarChart2 },
    { name: 'Configuración', href: '/admin/settings', icon: Settings }
  ];
  
  const instructorNavigation = [
    { name: 'Dashboard', href: '/instructor', icon: Home },
    { name: 'Mis Guías', href: '/instructor/guides', icon: BookOpen },
    { name: 'Mis Actividades', href: '/instructor/activities', icon: FileText },
    { name: 'Eventos', href: '/instructor/events', icon: Calendar },
    { name: 'Ayuda', href: '/instructor/help', icon: HelpCircle }
  ];
  
  const navigation = isAdmin ? adminNavigation : instructorNavigation;
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-blue-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-900">
            <h1 className="text-xl font-bold text-white">CTPGA Manager</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => 
                !item.children ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white hover:bg-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                ) : (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleCollapse(item.name)}
                      className="w-full text-white hover:bg-blue-700 group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          collapsed[item.name] ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {collapsed[item.name] && (
                      <div className="mt-1 pl-4 space-y-1">
                        {item.children.map((child) => (
                          <a
                            key={child.name}
                            href={child.href}
                            className="text-blue-100 hover:bg-blue-700 group flex items-center pl-6 py-2 text-sm font-medium rounded-md"
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs font-medium text-blue-200">
                  {user?.role === 'superadmin' ? 'Super Administrador' : 
                   user?.role === 'admin' ? 'Administrador' : 'Instructor'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};