import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';

const ExcelUploader = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const cleanText = (text) => {
    if (!text) return '';
    return text.toString()
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã/g, 'Á')
      .replace(/Ã‰/g, 'É')
      .replace(/Ã/g, 'Í')
      .replace(/Ã"/g, 'Ó')
      .replace(/Ãš/g, 'Ú')
      .replace(/Ã'/g, 'Ñ')
      .trim();
  };

  const processExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setProcessingProgress(20);
          
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setProcessingProgress(40);
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          setProcessingProgress(60);
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('El archivo Excel debe contener al menos una fila de encabezados y una fila de datos');
          }
          
          setProcessingProgress(80);
          
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          // Mapear columnas esperadas
          const columnMapping = {
            'Tipo': ['tipo', 'type', 'clasificacion'],
            'Certificacion': ['certificacion', 'certificación', 'cert', 'certificate'],
            'Orden': ['orden', 'order', 'numero_orden', 'nro_orden'],
            'SIAF': ['siaf', 'codigo_siaf', 'cod_siaf'],
            'Area': ['area', 'área', 'department', 'departamento'],
            'Compromiso': ['compromiso', 'commitment', 'descripcion', 'monto'],
            'Fecha': ['fecha', 'date', 'fecha_inicio'],
            'RUC': ['ruc', 'tax_id', 'numero_ruc'],
            'Nombre': ['nombre', 'name', 'nombres', 'apellidos'],
            'Concepto_Orden': ['concepto_orden', 'concepto orden', 'order_concept'],
            'Concepto_Pedido': ['concepto_pedido', 'concepto pedido', 'request_concept']
          };
          
          // Encontrar índices de columnas
          const columnIndexes = {};
          Object.keys(columnMapping).forEach(key => {
            const possibleNames = columnMapping[key];
            const index = headers.findIndex(header => 
              possibleNames.some(name => 
                header && header.toString().toLowerCase().includes(name.toLowerCase())
              )
            );
            if (index !== -1) {
              columnIndexes[key] = index;
            }
          });
          
          // Procesar datos en lotes para evitar bloqueo del UI
          const processedData = [];
          const batchSize = 100;
          
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            
            batch.forEach((row, rowIndex) => {
              if (row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
                // Extraer monto del campo compromiso si es numérico
                const compromisoValue = row[columnIndexes.Compromiso] || '';
                let monto = 0;
                let compromiso = cleanText(compromisoValue);
                
                // Si el compromiso es un número, usarlo como monto
                const numericValue = parseFloat(compromisoValue);
                if (!isNaN(numericValue) && numericValue > 0) {
                  monto = numericValue;
                } else {
                  // Buscar números en el texto del compromiso
                  const montoMatch = compromisoValue.toString().match(/[\d,]+\.?\d*/);
                  if (montoMatch) {
                    const cleanNumber = montoMatch[0].replace(/,/g, '');
                    monto = parseFloat(cleanNumber) || 0;
                  }
                }
                
                const processedRow = {
                  id: Date.now() + i + rowIndex,
                  tipo: cleanText(row[columnIndexes.Tipo] || 'Orden'),
                  certificacion: cleanText(row[columnIndexes.Certificacion] || ''),
                  orden: cleanText(row[columnIndexes.Orden] || `ORD-${Date.now()}-${i + rowIndex}`),
                  siaf: cleanText(row[columnIndexes.SIAF] || ''),
                  area: cleanText(row[columnIndexes.Area] || 'Sin área'),
                  compromiso: compromiso,
                  fecha: cleanText(row[columnIndexes.Fecha] || new Date().toISOString().split('T')[0]),
                  ruc: cleanText(row[columnIndexes.RUC] || ''),
                  nombre: cleanText(row[columnIndexes.Nombre] || 'Sin nombre'),
                  concepto_orden: cleanText(row[columnIndexes.Concepto_Orden] || ''),
                  concepto_pedido: cleanText(row[columnIndexes.Concepto_Pedido] || ''),
                  monto: monto,
                  estado: 'pendiente'
                };
                
                // Validar que tenga datos mínimos requeridos
                if (processedRow.ruc && processedRow.nombre && processedRow.orden) {
                  processedData.push(processedRow);
                }
              }
            });
            
            // Actualizar progreso
            setProcessingProgress(80 + (20 * (i + batchSize) / rows.length));
            
            // Permitir que el UI se actualice
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          setProcessingProgress(100);
          resolve(processedData);
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFiles = async (files) => {
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (!excelFile) {
      toast({
        title: "Error de archivo",
        description: "Por favor selecciona un archivo Excel válido (.xlsx o .xls)",
        variant: "destructive"
      });
      return;
    }

    if (excelFile.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "Archivo muy grande",
        description: "El archivo no debe superar los 50MB",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const processedData = await processExcelFile(excelFile);
      
      if (processedData.length === 0) {
        toast({
          title: "Archivo vacío",
          description: "No se encontraron datos válidos en el archivo Excel",
          variant: "destructive"
        });
        return;
      }

      onDataLoaded(processedData);
      
      toast({
        title: "¡Archivo procesado exitosamente!",
        description: `Se cargaron ${processedData.length} registros correctamente.`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: "Error al procesar archivo",
        description: error.message || "Hubo un problema al procesar el archivo Excel",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Cargar Archivo Excel</h2>
        <p className="text-gray-300">
          Sube el archivo Excel con las órdenes de servicio (hasta 1000+ registros)
        </p>
      </div>

      {/* Drop Zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-purple-400 bg-purple-500/20'
            : 'border-gray-400 hover:border-purple-400 hover:bg-purple-500/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto"
              >
                <FileSpreadsheet className="w-full h-full text-purple-400" />
              </motion.div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              
              <p className="text-white font-semibold">
                Procesando archivo... {Math.round(processingProgress)}%
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-16 h-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Arrastra tu archivo Excel aquí
                </h3>
                <p className="text-gray-400">
                  o haz clic para seleccionar (máximo 50MB)
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Seleccionar Archivo
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Formato del archivo Excel requerido</h4>
            <ul className="text-blue-200 space-y-1 text-sm">
              <li>• <strong>Tipo:</strong> Tipo de documento (Orden/Contrato)</li>
              <li>• <strong>Certificación:</strong> Número de certificación profesional</li>
              <li>• <strong>Orden:</strong> Número de orden de servicio</li>
              <li>• <strong>SIAF:</strong> Código SIAF del compromiso</li>
              <li>• <strong>Área:</strong> Área de trabajo asignada</li>
              <li>• <strong>Compromiso:</strong> Monto del compromiso (se extrae automáticamente)</li>
              <li>• <strong>Fecha:</strong> Fecha de inicio del servicio</li>
              <li>• <strong>RUC:</strong> RUC del proveedor</li>
              <li>• <strong>Nombre:</strong> Nombre completo del profesional</li>
              <li>• <strong>Concepto_Orden:</strong> Concepto detallado de la orden</li>
              <li>• <strong>Concepto_Pedido:</strong> Concepto del pedido asociado</li>
            </ul>
            <div className="mt-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200 font-semibold">Mejoras implementadas:</span>
              </div>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Soporte para archivos grandes (1000+ registros)</li>
                <li>• Corrección automática de caracteres especiales</li>
                <li>• Detección inteligente de columnas</li>
                <li>• Extracción automática de montos del campo compromiso</li>
                <li>• Procesamiento por lotes para mejor rendimiento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploader;