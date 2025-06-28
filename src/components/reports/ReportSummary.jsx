import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const ReportSummary = ({ summaryReport }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-300">Disponibles</h3>
            <p className="text-2xl font-bold text-white">{summaryReport.available.length}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-sm text-green-200 mt-2">Aptos para contratación</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-yellow-300">Advertencia</h3>
            <p className="text-2xl font-bold text-white">{summaryReport.warning.length}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-sm text-yellow-200 mt-2">Cerca del límite</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-6 rounded-xl border border-red-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-300">No Disponibles</h3>
            <p className="text-2xl font-bold text-white">{summaryReport.unavailable.length}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-sm text-red-200 mt-2">Límite alcanzado</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 p-6 rounded-xl border border-gray-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-300">Sin Clasificar</h3>
            <p className="text-2xl font-bold text-white">{summaryReport.unassigned.length}</p>
          </div>
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-200 mt-2">Requieren configuración</p>
      </motion.div>
    </div>
  );
};

export default ReportSummary;