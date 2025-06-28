import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, User, Building, Search, FileText, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ProviderModal from '@/components/ProviderModal';

const PersonalRegistry = ({ providers, groupedPersonal, onProvidersUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleAddProvider = () => {
    setEditingProvider(null);
    setIsModalOpen(true);
  };

  const handleEditProvider = (provider) => {
    setEditingProvider(provider);
    setIsModalOpen(true);
  };

  const handleDeleteProvider = (providerId) => {
    const updatedProviders = providers.filter(p => p.id !== providerId);
    onProvidersUpdate(updatedProviders);
    toast({
      title: "Proveedor eliminado",
      description: "El proveedor ha sido eliminado exitosamente.",
    });
  };

  const handleSaveProvider = async (providerData) => {
    try {
      let updatedProviders;
      
      if (editingProvider && editingProvider.id) {
        // Actualizar proveedor existente
        updatedProviders = providers.map(p => 
          p.id === editingProvider.id ? { ...providerData, id: editingProvider.id } : p
        );
        toast({
          title: "Proveedor actualizado",
          description: "Los datos del proveedor han sido actualizados correctamente.",
        });
      } else {
        // Verificar si ya existe un proveedor con el mismo RUC
        const existingProvider = providers.find(p => p.ruc === providerData.ruc);
        if (existingProvider) {
          // Actualizar el proveedor existente
          updatedProviders = providers.map(p => 
            p.ruc === providerData.ruc ? { ...providerData, id: p.id } : p
          );
          toast({
            title: "Proveedor actualizado",
            description: "Se actualizó el proveedor existente con el mismo RUC.",
          });
        } else {
          // Crear nuevo proveedor
          const newProvider = {
            ...providerData,
            id: Date.now(),
            createdAt: new Date().toISOString()
          };
          updatedProviders = [...providers, newProvider];
          toast({
            title: "Proveedor registrado",
            description: "El nuevo proveedor ha sido registrado exitosamente.",
          });
        }
      }
      
      // Actualizar la lista de proveedores
      onProvidersUpdate(updatedProviders);
      
      // Cerrar modal
      setIsModalOpen(false);
      setEditingProvider(null);
      
    } catch (error) {
      console.error('Error saving provider:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar el proveedor.",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'profesional':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'tecnico':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'tecnico-3':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getMaxMonths = (type) => {
    switch (type) {
      case 'profesional':
        return 6;
      case 'tecnico':
        return 12;
      case 'tecnico-3':
        return 3;
      default:
        return 0;
    }
  };

  const getProviderByRUC = (ruc) => {
    return providers.find(p => p.ruc === ruc);
  };

  // Filtrar personal basado en búsqueda
  const filteredPersonal = Object.values(groupedPersonal).filter(person => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.nombre.toLowerCase().includes(searchLower) ||
      person.ruc.includes(searchTerm) ||
      person.area.toLowerCase().includes(searchLower)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredPersonal.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPersonal = filteredPersonal.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Registro de Personal</h2>
          <p className="text-gray-300">
            Gestiona el personal y su clasificación profesional
          </p>
        </div>
        <Button
          onClick={handleAddProvider}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre, RUC o área..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
        />
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-gray-300">
        <span>
          Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredPersonal.length)} de {filteredPersonal.length} personas
        </span>
        <span>
          Total: {Object.keys(groupedPersonal).length} personas registradas
        </span>
      </div>

      {/* Personal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedPersonal.map((person, index) => {
          const provider = getProviderByRUC(person.ruc);
          const key = `${person.ruc}-${person.nombre}`;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{person.nombre}</h3>
                    <p className="text-xs text-gray-400">{person.ruc}</p>
                  </div>
                </div>
                {provider && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditProvider(provider)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{person.area}</span>
                </div>
                
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                  provider ? getTypeColor(provider.type) : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {provider ? (
                    <>
                      {provider.type === 'profesional' && 'Profesional'}
                      {provider.type === 'tecnico' && 'Técnico'}
                      {provider.type === 'tecnico-3' && 'Técnico (3 meses)'}
                    </>
                  ) : (
                    'Sin clasificar'
                  )}
                </div>
                
                {provider && (
                  <div className="text-sm text-gray-400">
                    Límite: {getMaxMonths(provider.type)} meses consecutivos
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-blue-500/20 rounded">
                    <FileText className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <div className="text-blue-300 font-semibold">{person.totalOrders}</div>
                    <div className="text-blue-200">Total</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-500/20 rounded">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                    <div className="text-yellow-300 font-semibold">{person.pendingOrders}</div>
                    <div className="text-yellow-200">Pendientes</div>
                  </div>
                  <div className="text-center p-2 bg-green-500/20 rounded">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-green-400" />
                    <div className="text-green-300 font-semibold">{person.assignedOrders}</div>
                    <div className="text-green-200">Asignadas</div>
                  </div>
                </div>

                {!provider && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingProvider({
                        name: person.nombre,
                        ruc: person.ruc,
                        contactPerson: person.nombre,
                        type: 'profesional'
                      });
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-xs"
                  >
                    Clasificar Profesional
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 2);
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page 
                    ? "bg-purple-600 text-white" 
                    : "border-white/20 text-gray-300 hover:bg-white/10"
                  }
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {filteredPersonal.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-500">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {Object.keys(groupedPersonal).length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No hay personal registrado
          </h3>
          <p className="text-gray-500 mb-6">
            Carga un archivo Excel para comenzar
          </p>
        </div>
      )}

      {/* Providers Section */}
      {providers.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6">Proveedores Registrados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{provider.name}</h4>
                      <p className="text-xs text-gray-400">{provider.ruc}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditProvider(provider)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-1 h-auto"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProvider(provider.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(provider.type)}`}>
                  {provider.type === 'profesional' && 'Profesional'}
                  {provider.type === 'tecnico' && 'Técnico'}
                  {provider.type === 'tecnico-3' && 'Técnico (3 meses)'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <ProviderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProvider(null);
        }}
        onSave={handleSaveProvider}
        provider={editingProvider}
      />
    </div>
  );
};

export default PersonalRegistry;