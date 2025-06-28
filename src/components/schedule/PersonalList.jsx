import React from 'react';
import { motion } from 'framer-motion';
import { User, Search, AlertTriangle, CheckCircle } from 'lucide-react';

const PersonalList = ({ 
  groupedPersonal, 
  providers, 
  searchTerm, 
  setSearchTerm, 
  selectedPerson, 
  onPersonSelect,
  getPersonStatus,
  getStatusColor 
}) => {
  const getProviderInfo = (ruc) => {
    return providers.find(p => p.ruc === ruc);
  };

  // Filtrar personal basado en búsqueda
  const filteredPersonal = Object.entries(groupedPersonal).filter(([key, person]) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.nombre.toLowerCase().includes(searchLower) ||
      person.ruc.includes(searchTerm) ||
      person.area.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Personal ({Object.keys(groupedPersonal).length})
      </h3>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar personal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-400"
        />
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPersonal.map(([key, person]) => {
          const provider = getProviderInfo(person.ruc);
          const status = getPersonStatus(person);
          
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              onClick={() => onPersonSelect(key)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedPerson?.ruc === person.ruc && selectedPerson?.nombre === person.nombre
                  ? 'border-purple-400 bg-purple-500/20'
                  : getStatusColor(status)
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">{person.nombre}</h4>
                <div className="flex items-center gap-1">
                  {status === 'danger' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                  {status === 'safe' && <CheckCircle className="w-4 h-4 text-green-400" />}
                </div>
              </div>
              
              <p className="text-xs opacity-75 mb-1">{person.ruc}</p>
              <p className="text-xs opacity-75 mb-2">{person.area}</p>
              
              <div className="flex justify-between text-xs">
                <span>{provider?.type || 'Sin clasificar'}</span>
                <span>{person.pendingOrders} pendientes</span>
              </div>
            </motion.div>
          );
        })}
        
        {filteredPersonal.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 mx-auto text-gray-500 mb-2" />
            <p className="text-gray-400 text-sm">No se encontraron resultados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalList;