import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('');
  const [errors, setErrors] = useState<{name?: string; email?: string; password?: string; area?: string}>({});
  const { register, isLoading, error } = useAuth();

  const validateForm = () => {
    const newErrors: {name?: string; email?: string; password?: string; area?: string} = {};
    let isValid = true;

    if (!name) {
      newErrors.name = 'El nombre es requerido';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (!area) {
      newErrors.area = 'El área es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await register(name, email, password, area);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Registro de Instructor</h2>
        <p className="mt-2 text-gray-600">Crea tu cuenta de instructor</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo"
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          fullWidth
          placeholder="Juan Pérez"
        />
        
        <Input
          label="Email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          fullWidth
          placeholder="correo@ejemplo.com"
        />
        
        <Input
          label="Contraseña"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          fullWidth
          placeholder="••••••••"
        />
        
        <Input
          label="Área de especialización"
          type="text"
          id="area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          error={errors.area}
          fullWidth
          placeholder="Ej: Desarrollo de Software"
        />
        
        <div className="pt-2">
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            isLoading={isLoading}
          >
            Registrarse
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </a>
        </p>
      </div>
    </Card>
  );
};