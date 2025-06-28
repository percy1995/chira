import React from 'react';
import { TrendingUp } from 'lucide-react';

const MonthlyAnalysis = ({ selectedMonth, months, personalData, workSchedule }) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Análisis Mensual - {months[selectedMonth]} 2025
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-blue-500/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-300">
            {personalData.filter(order => workSchedule[order.id]?.includes(selectedMonth)).length}
          </div>
          <div className="text-blue-200">Órdenes Activas</div>
        </div>
        
        <div className="text-center p-4 bg-green-500/20 rounded-lg">
          <div className="text-2xl font-bold text-green-300">
            {new Set(personalData
              .filter(order => workSchedule[order.id]?.includes(selectedMonth))
              .map(order => order.ruc)
            ).size}
          </div>
          <div className="text-green-200">Proveedores Activos</div>
        </div>
        
        <div className="text-center p-4 bg-purple-500/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-300">
            {personalData
              .filter(order => workSchedule[order.id]?.includes(selectedMonth))
              .reduce((sum, order) => sum + (order.monto || 0), 0)
              .toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
            }
          </div>
          <div className="text-purple-200">Monto Total</div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAnalysis;