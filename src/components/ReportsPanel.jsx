import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Search, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportSummary from '@/components/reports/ReportSummary';
import ConsolidatedReportTable from '@/components/reports/ConsolidatedReportTable';
import MonthlyAnalysis from '@/components/reports/MonthlyAnalysis';
import { 
  generateConsolidatedReport, 
  generateSummaryReport, 
  exportToExcel, 
  exportToPDF 
} from '@/components/reports/ReportGenerator';
import { getStatusIcon, getStatusColor } from '@/components/reports/ReportUtils';

const ReportsPanel = ({ personalData, groupedPersonal, providers, workSchedule }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 15;

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const consolidatedReport = generateConsolidatedReport(groupedPersonal, providers, workSchedule);
  const summaryReport = generateSummaryReport(groupedPersonal, providers, workSchedule);

  // Filtrar reporte consolidado
  const filteredReport = consolidatedReport.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.personName.toLowerCase().includes(searchLower) ||
      item.personRuc.includes(searchTerm) ||
      item.personArea.toLowerCase().includes(searchLower) ||
      item.statusText.toLowerCase().includes(searchLower) ||
      item.orders.some(order => order.orden.toLowerCase().includes(searchLower))
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReport = filteredReport.slice(startIndex, startIndex + itemsPerPage);

  const handleExportExcel = () => {
    exportToExcel(filteredReport, months);
  };

  const handleExportPDF = () => {
    exportToPDF(filteredReport);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Reportes y Análisis</h2>
          <p className="text-gray-300">
            Reporte consolidado por persona con meses consecutivos
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {months.map((month, index) => (
              <option key={index} value={index} className="bg-slate-800">
                {month} 2025
              </option>
            ))}
          </select>
          <Button
            onClick={handleExportExcel}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <ReportSummary summaryReport={summaryReport} />

      {/* Explicación del Sistema de Montos */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Cómo Funciona el Sistema de Montos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">💰 Cálculo de Monto Total</h4>
            <ul className="text-blue-200 space-y-1 text-sm">
              <li>• Se suman TODAS las órdenes de cada persona</li>
              <li>• Incluye órdenes asignadas y pendientes</li>
              <li>• El monto se extrae automáticamente del campo "Compromiso"</li>
              <li>• Se muestra en formato de moneda peruana (PEN)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-300 mb-2">🗄️ Almacenamiento Local</h4>
            <ul className="text-green-200 space-y-1 text-sm">
              <li>• Datos guardados en localStorage del navegador</li>
              <li>• Persistencia automática en cada cambio</li>
              <li>• No requiere conexión a internet</li>
              <li>• Datos disponibles al recargar la página</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-200 text-sm">
            <strong>💡 Para servidor local:</strong> Puedes usar bases de datos como SQLite, MySQL, PostgreSQL o MongoDB. 
            El sistema actual funciona completamente offline y es ideal para pruebas y desarrollo.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Reporte Consolidado por Persona</h3>
          <div className="text-sm text-gray-300">
            Total: {filteredReport.length} personas
          </div>
        </div>
        
        <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <p className="text-blue-200 text-sm">
            <strong>Nota:</strong> Este reporte muestra una fila por persona con información consolidada 
            de todas sus órdenes y meses laborados consecutivos. El monto total incluye TODAS las órdenes.
          </p>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUC, área, estado u orden..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
          />
        </div>

        <ConsolidatedReportTable
          paginatedReport={paginatedReport}
          months={months}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          filteredReport={filteredReport}
        />
      </div>

      {/* Monthly Analysis */}
      <MonthlyAnalysis
        selectedMonth={selectedMonth}
        months={months}
        personalData={personalData}
        workSchedule={workSchedule}
      />
    </div>
  );
};

export default ReportsPanel;