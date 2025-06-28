import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ConsolidatedReportTable = ({ 
  paginatedReport, 
  months, 
  getStatusIcon, 
  getStatusColor,
  currentPage,
  totalPages,
  setCurrentPage,
  startIndex,
  itemsPerPage,
  filteredReport
}) => {
  const [expandedRows, setExpandedRows] = React.useState({});
  
  const getSemaforoIcon = (status) => {
    switch (status) {
      case 'safe':
        return <Circle className="w-4 h-4 text-green-400 fill-current" />;
      case 'warning':
        return <Circle className="w-4 h-4 text-yellow-400 fill-current" />;
      case 'danger':
        return <Circle className="w-4 h-4 text-red-400 fill-current" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400 fill-current" />;
    }
  };

  const toggleRowExpansion = (personRuc) => {
    setExpandedRows(prev => ({
      ...prev,
      [personRuc]: !prev[personRuc]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left p-3 text-gray-300">Semáforo</th>
              <th className="text-left p-3 text-gray-300">Personal</th>
              <th className="text-left p-3 text-gray-300">Tipo</th>
              <th className="text-left p-3 text-gray-300">Órdenes</th>
              <th className="text-left p-3 text-gray-300">Meses Laborados</th>
              <th className="text-left p-3 text-gray-300">Consecutivos</th>
              <th className="text-left p-3 text-gray-300">Estado</th>
              <th className="text-left p-3 text-gray-300">Monto Total</th>
              <th className="text-left p-3 text-gray-300">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReport.map((item, index) => (
              <React.Fragment key={`${item.personRuc}-${index}`}>
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td className="p-3">
                    <div className="flex justify-center">
                      {getSemaforoIcon(item.status)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium text-white">{item.personName}</div>
                      <div className="text-xs text-gray-400">{item.personRuc}</div>
                      <div className="text-xs text-gray-400">{item.personArea}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                      item.provider ? getStatusColor('safe') : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {item.provider?.type || 'Sin clasificar'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="text-white">
                      <div>Total: {item.totalOrders}</div>
                      <div className="text-xs text-green-400">Asignadas: {item.assignedOrders}</div>
                      <div className="text-xs text-yellow-400">Pendientes: {item.pendingOrders}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-white">
                      {item.assignedMonths.length > 0 
                        ? item.assignedMonths.map(m => months[m]).join(', ')
                        : 'Sin asignar'
                      }
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-white">
                      {item.consecutiveMonths}/{item.maxMonths}
                    </div>
                    {item.remainingMonths > 0 && (
                      <div className="text-xs text-gray-400">
                        {item.remainingMonths} restantes
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.statusText}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-green-400 font-semibold">
                      {formatCurrency(item.totalAmount)}
                    </div>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(item.personRuc)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {expandedRows[item.personRuc] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </td>
                </motion.tr>
                
                {/* Expanded row with order details */}
                {expandedRows[item.personRuc] && (
                  <tr className="bg-white/5">
                    <td colSpan="9" className="p-4">
                      <div className="space-y-2">
                        <h5 className="font-semibold text-white mb-3">Detalle de Órdenes:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {item.orders.map((order, orderIndex) => (
                            <div key={orderIndex} className="bg-white/10 rounded-lg p-3 border border-white/20">
                              <div className="font-medium text-purple-300">{order.orden}</div>
                              <div className="text-xs text-gray-400 mb-1">SIAF: {order.siaf}</div>
                              <div className="text-xs text-green-400 mb-2">
                                {formatCurrency(order.monto)}
                              </div>
                              {order.assignedMonths.length > 0 && (
                                <div className="text-xs text-blue-300">
                                  Meses: {order.assignedMonths.map(m => months[m]).join(', ')}
                                </div>
                              )}
                              {order.assignedMonths.length === 0 && (
                                <div className="text-xs text-yellow-400">Sin asignar</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReport.length)} de {filteredReport.length} personas
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
    </div>
  );
};

export default ConsolidatedReportTable;