import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ProviderModal = ({ isOpen, onClose, onSave, provider }) => {
  const [formData, setFormData] = useState({
    name: '',
    ruc: '',
    contactPerson: '',
    type: 'profesional',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (provider) {
        setFormData({
          name: provider.name || '',
          ruc: provider.ruc || '',
          contactPerson: provider.contactPerson || '',
          type: provider.type || 'profesional',
          description: provider.description || ''
        });
      } else {
        setFormData({
          name: '',
          ruc: '',
          contactPerson: '',
          type: 'profesional',
          description: ''
        });
      }
    }
  }, [provider, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validaciones
      if (!formData.name.trim() || !formData.ruc.trim() || !formData.contactPerson.trim()) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos obligatorios.",
          variant: "destructive"
        });
        return;
      }

      // Validar RUC (debe tener 11 dígitos)
      const rucClean = formData.ruc.trim();
      if (rucClean.length !== 11 || !/^\d+$/.test(rucClean)) {
        toast({
          title: "RUC inválido",
          description: "El RUC debe tener exactamente 11 dígitos numéricos.",
          variant: "destructive"
        });
        return;
      }

      // Preparar datos limpios
      const cleanData = {
        name: formData.name.trim(),
        ruc: rucClean,
        contactPerson: formData.contactPerson.trim(),
        type: formData.type,
        description: formData.description.trim()
      };

      // Llamar a la función de guardado
      await onSave(cleanData);
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('Error saving provider:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar el proveedor. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {provider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 disabled:opacity-50"
              placeholder="Ej: Empresa ABC S.A.C."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              RUC *
            </label>
            <input
              type="text"
              name="ruc"
              value={formData.ruc}
              onChange={handleChange}
              disabled={isSubmitting}
              maxLength={11}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 disabled:opacity-50"
              placeholder="20123456789"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Persona de Contacto *
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 disabled:opacity-50"
              placeholder="Nombre del contacto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Profesional *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 disabled:opacity-50"
              required
            >
              <option value="profesional" className="bg-slate-800">Profesional (máx. 6 meses)</option>
              <option value="tecnico" className="bg-slate-800">Técnico (máx. 12 meses)</option>
              <option value="tecnico-3" className="bg-slate-800">Técnico (máx. 3 meses)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 disabled:opacity-50"
              placeholder="Descripción adicional del proveedor..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 disabled:opacity-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProviderModal;