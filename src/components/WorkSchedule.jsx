import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import PersonalList from '@/components/schedule/PersonalList';
import ScheduleArea from '@/components/schedule/ScheduleArea';
import CalendarOverview from '@/components/schedule/CalendarOverview';

const WorkSchedule = ({ personalData, groupedPersonal, providers, workSchedule, onScheduleUpdate }) => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState({});
  const [tempSchedule, setTempSchedule] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getProviderInfo = (ruc) => {
    return providers.find(p => p.ruc === ruc);
  };

  const getMaxMonthsForType = (type) => {
    switch (type) {
      case 'profesional': return 6;
      case 'tecnico': return 12;
      case 'tecnico-3': return 3;
      default: return 0;
    }
  };

  const getConsecutiveMonths = (monthsArray) => {
    if (monthsArray.length === 0) return 0;
    
    const sortedMonths = [...monthsArray].sort((a, b) => a - b);
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < sortedMonths.length; i++) {
      if (sortedMonths[i] === sortedMonths[i - 1] + 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }
    
    return maxConsecutive;
  };

  const handlePersonSelect = (personKey) => {
    const person = groupedPersonal[personKey];
    setSelectedPerson(person);
    
    // Inicializar órdenes seleccionadas con las ya asignadas
    const initialSelected = {};
    person.orders.forEach(order => {
      const assignedMonths = workSchedule[order.id] || [];
      if (assignedMonths.length > 0) {
        initialSelected[order.id] = assignedMonths;
      }
    });
    setSelectedOrders(initialSelected);
    setTempSchedule(initialSelected);
  };

  const handleOrderMonthToggle = (orderId, monthIndex) => {
    const currentMonths = tempSchedule[orderId] || [];
    let newMonths;
    
    if (currentMonths.includes(monthIndex)) {
      newMonths = currentMonths.filter(m => m !== monthIndex);
    } else {
      newMonths = [...currentMonths, monthIndex];
    }
    
    // Verificar límites consecutivos para toda la persona
    const provider = getProviderInfo(selectedPerson.ruc);
    if (provider && newMonths.length > 0) {
      // Obtener todos los meses asignados de todas las órdenes de la persona
      const allPersonMonths = [];
      selectedPerson.orders.forEach(order => {
        if (order.id === orderId) {
          allPersonMonths.push(...newMonths);
        } else {
          const orderMonths = tempSchedule[order.id] || [];
          allPersonMonths.push(...orderMonths);
        }
      });
      
      const consecutiveMonths = getConsecutiveMonths(allPersonMonths);
      const maxMonths = getMaxMonthsForType(provider.type);
      
      if (consecutiveMonths > maxMonths) {
        toast({
          title: "Límite excedido",
          description: `Los ${provider.type}s no pueden trabajar más de ${maxMonths} meses consecutivos.`,
          variant: "destructive"
        });
        return;
      }
    }
    
    setTempSchedule(prev => ({
      ...prev,
      [orderId]: newMonths
    }));
  };

  const handleSaveSchedule = () => {
    if (!selectedPerson) return;
    
    const updatedSchedule = { ...workSchedule };
    
    // Actualizar el cronograma con las órdenes temporales
    Object.keys(tempSchedule).forEach(orderId => {
      updatedSchedule[orderId] = tempSchedule[orderId];
    });
    
    // Limpiar órdenes que ya no están seleccionadas
    selectedPerson.orders.forEach(order => {
      if (!tempSchedule[order.id]) {
        delete updatedSchedule[order.id];
      }
    });
    
    onScheduleUpdate(updatedSchedule);
    setSelectedPerson(null);
    setSelectedOrders({});
    setTempSchedule({});
    
    toast({
      title: "Cronograma guardado",
      description: "Las asignaciones han sido guardadas exitosamente.",
    });
  };

  const getOrderStatus = (orderId) => {
    const order = personalData.find(o => o.id === orderId);
    const provider = getProviderInfo(order?.ruc);
    const assignedMonths = tempSchedule[orderId] || [];
    
    if (!provider || assignedMonths.length === 0) return 'unassigned';
    
    // Calcular meses consecutivos considerando todas las órdenes de la persona
    const allPersonMonths = [];
    selectedPerson.orders.forEach(orderItem => {
      const orderMonths = tempSchedule[orderItem.id] || [];
      allPersonMonths.push(...orderMonths);
    });
    
    const consecutiveMonths = getConsecutiveMonths(allPersonMonths);
    const maxMonths = getMaxMonthsForType(provider.type);
    
    if (consecutiveMonths >= maxMonths) return 'danger';
    if (consecutiveMonths >= maxMonths - 1) return 'warning';
    return 'safe';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'danger': return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'safe': return 'bg-green-500/20 border-green-500/50 text-green-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getPersonStatus = (person) => {
    const provider = getProviderInfo(person.ruc);
    if (!provider) return 'unassigned';
    
    // Verificar todas las órdenes asignadas de la persona
    const allAssignedMonths = [];
    person.orders.forEach(order => {
      const months = workSchedule[order.id] || [];
      allAssignedMonths.push(...months);
    });
    
    if (allAssignedMonths.length === 0) return 'unassigned';
    
    const consecutiveMonths = getConsecutiveMonths(allAssignedMonths);
    const maxMonths = getMaxMonthsForType(provider.type);
    
    if (consecutiveMonths >= maxMonths) return 'danger';
    if (consecutiveMonths >= maxMonths - 1) return 'warning';
    return 'safe';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Cronograma de Trabajo</h2>
        <p className="text-gray-300">
          Selecciona una persona para asignar sus órdenes a los meses correspondientes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal List */}
        <div className="lg:col-span-1">
          <PersonalList
            groupedPersonal={groupedPersonal}
            providers={providers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedPerson={selectedPerson}
            onPersonSelect={handlePersonSelect}
            getPersonStatus={getPersonStatus}
            getStatusColor={getStatusColor}
          />
        </div>

        {/* Schedule Area */}
        <div className="lg:col-span-2">
          <ScheduleArea
            selectedPerson={selectedPerson}
            providers={providers}
            tempSchedule={tempSchedule}
            months={months}
            onOrderMonthToggle={handleOrderMonthToggle}
            onSaveSchedule={handleSaveSchedule}
            onClose={() => setSelectedPerson(null)}
            getOrderStatus={getOrderStatus}
            getStatusColor={getStatusColor}
            getPersonStatus={getPersonStatus}
          />
        </div>
      </div>

      {/* Calendar Overview */}
      <CalendarOverview
        months={months}
        personalData={personalData}
        workSchedule={workSchedule}
        groupedPersonal={groupedPersonal}
        selectedPerson={selectedPerson}
      />

      {/* Legend */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="font-semibold text-white mb-3">Leyenda del Sistema Semáforo</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-300">Seguro (dentro del límite)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-300">Advertencia (cerca del límite)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-300">Peligro (límite alcanzado)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-300">Sin asignar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSchedule;