import React from 'react';
import { Calendar, DollarSign, User, FileText, Building } from 'lucide-react';

const CalendarOverview = ({ 
  months, 
  personalData, 
  workSchedule, 
  groupedPersonal, 
  selectedPerson 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Si hay una persona seleccionada, mostrar solo sus órdenes
  const getOrdersForMonth = (monthIndex) => {
    if (selectedPerson) {
      return selectedPerson.orders.filter(order => 
        workSchedule[order.id]?.includes(monthIndex)
      );
    }
    
    return personalData.filter(order => 
      workSchedule[order.id]?.includes(monthIndex)
    );
  };

  const getPersonForOrder = (order) => {
    if (selectedPerson) {
      return selectedPerson;
    }
    
    return Object.values(groupedPersonal).find(p => 
      p.orders.some(o => o.id === order.id)
    );
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        {selectedPerson 
          ? `Cronograma de ${selectedPerson.nombre} - 2025`
          : 'Vista General del Cronograma 2025'
        }
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {months.map((month, monthIndex) => {
          const ordersInMonth = getOrdersForMonth(monthIndex);
          const totalAmount = ordersInMonth.reduce((sum, order) => sum + (order.monto || 0), 0);
          
          return (
            <div key={monthIndex} className="bg-white/10 rounded-lg p-4 min-h-[250px]">
              <h4 className="font-semibold text-white mb-3 text-center">{month}</h4>
              
              {/* Summary */}
              {ordersInMonth.length > 0 && (
                <div className="mb-3 p-2 bg-blue-500/20 rounded text-xs">
                  <div className="text-blue-300 font-semibold">
                    {ordersInMonth.length} orden{ordersInMonth.length !== 1 ? 'es' : ''}
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {ordersInMonth.map(order => {
                  const person = getPersonForOrder(order);
                  
                  return (
                    <div key={`${order.id}-${monthIndex}`} className="p-3 rounded text-xs bg-purple-500/20 border border-purple-500/30">
                      {/* Número de Orden */}
                      <div className="flex items-center gap-1 mb-1">
                        <FileText className="w-3 h-3 text-purple-300" />
                        <p className="font-medium text-purple-200">{order.orden}</p>
                      </div>
                      
                      {/* SIAF */}
                      <p className="text-purple-300 text-xs mb-1">SIAF: {order.siaf}</p>
                      
                      {/* Nombre del Personal */}
                      <div className="flex items-center gap-1 mb-1">
                        <User className="w-3 h-3 text-blue-300" />
                        <p className="text-blue-200 text-xs font-medium">{person?.nombre}</p>
                      </div>
                      
                      {/* Área */}
                      <div className="flex items-center gap-1 mb-1">
                        <Building className="w-3 h-3 text-yellow-300" />
                        <p className="text-yellow-200 text-xs">{order.area}</p>
                      </div>
                      
                      {/* Monto */}
                      <div className="flex items-center gap-1 text-green-300 mt-2">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-semibold">{formatCurrency(order.monto)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {ordersInMonth.length === 0 && (
                <div className="text-center text-gray-500 text-xs mt-8">
                  Sin asignaciones
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedPerson && (
        <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <h5 className="font-semibold text-blue-300 mb-2">Resumen del Personal</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-200">Total Órdenes:</span>
              <div className="font-semibold text-white">{selectedPerson.orders.length}</div>
            </div>
            <div>
              <span className="text-blue-200">Órdenes Asignadas:</span>
              <div className="font-semibold text-white">{selectedPerson.assignedOrders}</div>
            </div>
            <div>
              <span className="text-blue-200">Pendientes:</span>
              <div className="font-semibold text-white">{selectedPerson.pendingOrders}</div>
            </div>
            <div>
              <span className="text-blue-200">Monto Total:</span>
              <div className="font-semibold text-green-300">
                {formatCurrency(selectedPerson.orders.reduce((sum, order) => sum + (order.monto || 0), 0))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarOverview;