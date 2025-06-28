import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, Calendar, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ExcelUploader from '@/components/ExcelUploader';
import PersonalRegistry from '@/components/PersonalRegistry';
import WorkSchedule from '@/components/WorkSchedule';
import ReportsPanel from '@/components/ReportsPanel';

const PersonalManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [personalData, setPersonalData] = useState([]);
  const [workSchedule, setWorkSchedule] = useState({});
  const [providers, setProviders] = useState([]);
  const [groupedPersonal, setGroupedPersonal] = useState({});

  useEffect(() => {
    // Cargar datos del localStorage
    const savedPersonal = localStorage.getItem('personalData');
    const savedSchedule = localStorage.getItem('workSchedule');
    const savedProviders = localStorage.getItem('providers');
    const savedGrouped = localStorage.getItem('groupedPersonal');
    
    if (savedPersonal) setPersonalData(JSON.parse(savedPersonal));
    if (savedSchedule) setWorkSchedule(JSON.parse(savedSchedule));
    if (savedProviders) setProviders(JSON.parse(savedProviders));
    if (savedGrouped) setGroupedPersonal(JSON.parse(savedGrouped));
  }, []);

  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const groupPersonalByRUC = (data) => {
    const grouped = {};
    
    data.forEach(order => {
      const key = `${order.ruc}-${order.nombre}`;
      if (!grouped[key]) {
        grouped[key] = {
          ruc: order.ruc,
          nombre: order.nombre,
          tipo: order.tipo,
          area: order.area,
          orders: [],
          totalOrders: 0,
          pendingOrders: 0,
          assignedOrders: 0
        };
      }
      
      grouped[key].orders.push(order);
      grouped[key].totalOrders++;
      
      // Verificar si la orden está asignada en el cronograma
      const isAssigned = workSchedule[order.id] && workSchedule[order.id].length > 0;
      if (isAssigned) {
        grouped[key].assignedOrders++;
      } else {
        grouped[key].pendingOrders++;
      }
    });
    
    return grouped;
  };

  const handleExcelData = (data) => {
    // Combinar datos existentes con nuevos datos
    const existingData = personalData || [];
    const newData = data.filter(newOrder => 
      !existingData.some(existing => existing.orden === newOrder.orden)
    );
    
    const combinedData = [...existingData, ...newData];
    const grouped = groupPersonalByRUC(combinedData);
    
    setPersonalData(combinedData);
    setGroupedPersonal(grouped);
    
    saveToLocalStorage('personalData', combinedData);
    saveToLocalStorage('groupedPersonal', grouped);
    
    toast({
      title: "¡Archivo cargado exitosamente!",
      description: `Se procesaron ${newData.length} nuevas órdenes. Total: ${combinedData.length} órdenes.`,
    });
  };

  const handleProviderUpdate = (updatedProviders) => {
    setProviders(updatedProviders);
    saveToLocalStorage('providers', updatedProviders);
    
    // Actualizar tipos en groupedPersonal basado en RUC
    const updatedGrouped = { ...groupedPersonal };
    Object.keys(updatedGrouped).forEach(key => {
      const person = updatedGrouped[key];
      const provider = updatedProviders.find(p => p.ruc === person.ruc);
      if (provider) {
        updatedGrouped[key].tipo = provider.type;
      }
    });
    
    setGroupedPersonal(updatedGrouped);
    saveToLocalStorage('groupedPersonal', updatedGrouped);
  };

  const handleScheduleUpdate = (updatedSchedule) => {
    setWorkSchedule(updatedSchedule);
    saveToLocalStorage('workSchedule', updatedSchedule);
    
    // Actualizar contadores en groupedPersonal
    const updatedGrouped = groupPersonalByRUC(personalData);
    setGroupedPersonal(updatedGrouped);
    saveToLocalStorage('groupedPersonal', updatedGrouped);
  };

  const getUniquePersonsCount = () => {
    return Object.keys(groupedPersonal).length;
  };

  const getTotalPendingOrders = () => {
    return Object.values(groupedPersonal).reduce((total, person) => total + person.pendingOrders, 0);
  };

  const tabs = [
    { id: 'upload', label: 'Cargar Excel', icon: Upload },
    { id: 'registry', label: 'Registro Personal', icon: Users },
    { id: 'schedule', label: 'Cronograma', icon: Calendar },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ];

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sistema de Gestión de Personal
          </h1>
          <p className="text-xl text-gray-300">
            Control de meses laborados y órdenes de servicio 2025
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          {activeTab === 'upload' && (
            <ExcelUploader onDataLoaded={handleExcelData} />
          )}
          
          {activeTab === 'registry' && (
            <PersonalRegistry 
              providers={providers}
              groupedPersonal={groupedPersonal}
              onProvidersUpdate={handleProviderUpdate}
            />
          )}
          
          {activeTab === 'schedule' && (
            <WorkSchedule 
              personalData={personalData}
              groupedPersonal={groupedPersonal}
              providers={providers}
              workSchedule={workSchedule}
              onScheduleUpdate={handleScheduleUpdate}
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportsPanel 
              personalData={personalData}
              groupedPersonal={groupedPersonal}
              providers={providers}
              workSchedule={workSchedule}
            />
          )}
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-500/30"
          >
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Personal Único</h3>
                <p className="text-blue-300">{getUniquePersonsCount()} personas</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Total Órdenes</h3>
                <p className="text-green-300">{personalData.length} órdenes</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Órdenes Pendientes</h3>
                <p className="text-yellow-300">{getTotalPendingOrders()} pendientes</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Proveedores</h3>
                <p className="text-purple-300">{providers.length} registrados</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalManagementSystem;