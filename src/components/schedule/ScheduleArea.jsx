import React from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Save, DollarSign, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScheduleArea = ({ 
  selectedPerson, 
  providers, 
  tempSchedule, 
  months, 
  onOrderMonthToggle, 
  onSaveSchedule, 
  onClose, 
  getOrderStatus, 
  getStatusColor,
  getPersonStatus 
}) => {
  const getProviderInfo = (ruc) => {
    return providers.find(p => p.ruc === ruc);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount || 0);
  };

  if (!selectedPerson) {
    return (
      <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          Selecciona una persona
        </h3>
        <p className="text-gray-500">
          Haz clic en una persona de la lista para asignar sus órdenes al cronograma
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Person Info */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{selectedPerson.nombre}</h3>
            <p className="text-gray-300">{selectedPerson.ruc} - {selectedPerson.area}</p>
            <div className="mt-2">
              {getProviderInfo(selectedPerson.ruc) ? (
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                  getStatusColor(getPersonStatus(selectedPerson))
                }`}>
                  {getProviderInfo(selectedPerson.ruc).type}
                </span>
              ) : (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-300 border-red-500/30">
                  Sin clasificar
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Órdenes de Servicio ({selectedPerson.orders.length})
        </h4>
        
        <div className="space-y-4">
          {selectedPerson.orders.map((order) => {
            const status = getOrderStatus(order.id);
            const assignedMonths = tempSchedule[order.id] || [];
            
            return (
              <div key={order.id} className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-semibold">{order.orden}</h5>
                      <p className="text-sm opacity-75">{order.concepto_orden}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-400 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(order.monto)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs opacity-60">
                    <div>SIAF: {order.siaf}</div>
                    <div>Fecha: {order.fecha}</div>
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      Área: {order.area}
                    </div>
                    <div>Compromiso: {order.compromiso}</div>
                  </div>
                </div>
                
                {/* Todos los 12 meses */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {months.slice(0, 6).map((month, monthIndex) => (
                    <button
                      key={monthIndex}
                      onClick={() => onOrderMonthToggle(order.id, monthIndex)}
                      className={`p-2 text-xs rounded transition-all duration-200 ${
                        assignedMonths.includes(monthIndex)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {months.slice(6, 12).map((month, monthIndex) => {
                    const actualMonthIndex = monthIndex + 6;
                    return (
                      <button
                        key={actualMonthIndex}
                        onClick={() => onOrderMonthToggle(order.id, actualMonthIndex)}
                        className={`p-2 text-xs rounded transition-all duration-200 ${
                          assignedMonths.includes(actualMonthIndex)
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
                
                {assignedMonths.length > 0 && (
                  <div className="mt-2 text-xs">
                    Meses asignados: {assignedMonths.map(m => months[m]).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSaveSchedule}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Cronograma
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleArea;