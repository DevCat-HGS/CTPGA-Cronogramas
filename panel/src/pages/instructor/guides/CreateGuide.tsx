import React, { useState } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Save, X, Plus, Trash2 } from 'lucide-react';

export const CreateGuide: React.FC = () => {
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [materials, setMaterials] = useState<string[]>(['']);
  const [development, setDevelopment] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const addObjective = () => {
    setObjectives([...objectives, '']);
  };
  
  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };
  
  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      const newObjectives = [...objectives];
      newObjectives.splice(index, 1);
      setObjectives(newObjectives);
    }
  };
  
  const addMaterial = () => {
    setMaterials([...materials, '']);
  };
  
  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
  };
  
  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      const newMaterials = [...materials];
      newMaterials.splice(index, 1);
      setMaterials(newMaterials);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!introduction.trim()) {
      newErrors.introduction = 'La introducción es requerida';
    }
    
    if (objectives.some(obj => !obj.trim())) {
      newErrors.objectives = 'Todos los objetivos deben estar completos';
    }
    
    if (materials.some(mat => !mat.trim())) {
      newErrors.materials = 'Todos los materiales deben estar completos';
    }
    
    if (!development.trim()) {
      newErrors.development = 'El desarrollo es requerido';
    }
    
    if (!evaluation.trim()) {
      newErrors.evaluation = 'La evaluación es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    
    if (!isDraft && !validateForm()) {
      return;
    }
    
    const guide = {
      title,
      introduction,
      objectives: objectives.filter(obj => obj.trim()),
      materials: materials.filter(mat => mat.trim()),
      development,
      evaluation,
      status: isDraft ? 'draft' : 'published',
    };
    
    console.log('Guide saved:', guide);
    // Here you would submit the guide to your backend
  };
  
  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Crear Nueva Guía</h1>
            <p className="mt-2 text-sm text-gray-700">
              Complete todos los campos para crear una nueva guía de actividad.
            </p>
          </div>
        </div>
        
        <form className="mt-6 space-y-6">
          <Card>
            <div className="space-y-4">
              <Input
                label="Título de la Guía"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                fullWidth
                placeholder="Ej: Desarrollo de una Aplicación Web con React"
              />
              
              <div>
                <label htmlFor="introduction" className="block text-sm font-medium text-gray-700">
                  Introducción
                </label>
                <textarea
                  id="introduction"
                  rows={4}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.introduction ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Breve introducción sobre la guía..."
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                ></textarea>
                {errors.introduction && (
                  <p className="mt-1 text-sm text-red-600">{errors.introduction}</p>
                )}
              </div>
            </div>
          </Card>
          
          <Card title="Objetivos">
            <div className="space-y-4">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    fullWidth
                    placeholder={`Objetivo ${index + 1}`}
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="p-2 text-gray-500 hover:text-red-500"
                    disabled={objectives.length <= 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {errors.objectives && (
                <p className="text-sm text-red-600">{errors.objectives}</p>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                icon={<Plus className="h-4 w-4" />}
              >
                Agregar Objetivo
              </Button>
            </div>
          </Card>
          
          <Card title="Materiales Requeridos">
            <div className="space-y-4">
              {materials.map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    fullWidth
                    placeholder={`Material ${index + 1}`}
                    value={material}
                    onChange={(e) => updateMaterial(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="p-2 text-gray-500 hover:text-red-500"
                    disabled={materials.length <= 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {errors.materials && (
                <p className="text-sm text-red-600">{errors.materials}</p>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterial}
                icon={<Plus className="h-4 w-4" />}
              >
                Agregar Material
              </Button>
            </div>
          </Card>
          
          <Card title="Desarrollo">
            <div>
              <textarea
                id="development"
                rows={8}
                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.development ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Desarrollo paso a paso de la actividad..."
                value={development}
                onChange={(e) => setDevelopment(e.target.value)}
              ></textarea>
              {errors.development && (
                <p className="mt-1 text-sm text-red-600">{errors.development}</p>
              )}
            </div>
          </Card>
          
          <Card title="Evaluación">
            <div>
              <textarea
                id="evaluation"
                rows={4}
                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.evaluation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Criterios para evaluar el cumplimiento de la actividad..."
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
              ></textarea>
              {errors.evaluation && (
                <p className="mt-1 text-sm text-red-600">{errors.evaluation}</p>
              )}
            </div>
          </Card>
          
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              icon={<X className="h-4 w-4" />}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e, true)}
              icon={<Save className="h-4 w-4" />}
            >
              Guardar como Borrador
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => handleSubmit(e, false)}
            >
              Publicar Guía
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};