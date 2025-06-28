import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const getProviderInfo = (providers, ruc) => {
  return providers.find(p => p.ruc === ruc);
};

export const getMaxMonthsForType = (type) => {
  switch (type) {
    case 'profesional': return 6;
    case 'tecnico': return 12;
    case 'tecnico-3': return 3;
    default: return 0;
  }
};

export const getConsecutiveMonths = (monthsArray) => {
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

export const cleanText = (text) => {
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

export const generateConsolidatedReport = (groupedPersonal, providers, workSchedule) => {
  const report = [];
  
  Object.values(groupedPersonal).forEach(person => {
    const provider = getProviderInfo(providers, person.ruc);
    
    // Calcular meses consecutivos consolidados para toda la persona
    const allPersonMonths = [];
    person.orders.forEach(order => {
      const months = workSchedule[order.id] || [];
      allPersonMonths.push(...months);
    });
    
    const consolidatedConsecutiveMonths = getConsecutiveMonths(allPersonMonths);
    const maxMonths = provider ? getMaxMonthsForType(provider.type) : 0;
    
    // Determinar estado consolidado de la persona
    let consolidatedStatus = 'unassigned';
    let consolidatedStatusText = 'Sin asignar';
    
    if (!provider) {
      consolidatedStatus = 'unassigned';
      consolidatedStatusText = 'Sin clasificar';
    } else if (allPersonMonths.length === 0) {
      consolidatedStatus = 'unassigned';
      consolidatedStatusText = 'Sin asignar';
    } else if (consolidatedConsecutiveMonths >= maxMonths) {
      consolidatedStatus = 'danger';
      consolidatedStatusText = 'Límite alcanzado';
    } else if (consolidatedConsecutiveMonths >= maxMonths - 1) {
      consolidatedStatus = 'warning';
      consolidatedStatusText = 'Cerca del límite';
    } else {
      consolidatedStatus = 'safe';
      consolidatedStatusText = 'Disponible';
    }
    
    // Obtener todas las órdenes asignadas
    const assignedOrders = person.orders.filter(order => 
      workSchedule[order.id] && workSchedule[order.id].length > 0
    );
    
    // Calcular monto total de TODAS las órdenes de la persona
    const totalAmount = person.orders.reduce((sum, order) => sum + (order.monto || 0), 0);
    
    // Una sola fila por persona con información consolidada
    report.push({
      personName: cleanText(person.nombre),
      personRuc: person.ruc,
      personArea: cleanText(person.area),
      provider: provider,
      totalOrders: person.orders.length,
      assignedOrders: assignedOrders.length,
      pendingOrders: person.orders.length - assignedOrders.length,
      assignedMonths: [...new Set(allPersonMonths)].sort((a, b) => a - b),
      consecutiveMonths: consolidatedConsecutiveMonths,
      maxMonths: maxMonths,
      status: consolidatedStatus,
      statusText: consolidatedStatusText,
      remainingMonths: Math.max(0, maxMonths - consolidatedConsecutiveMonths),
      totalAmount: totalAmount,
      orders: person.orders.map(order => ({
        orden: cleanText(order.orden),
        siaf: order.siaf,
        monto: order.monto || 0,
        assignedMonths: workSchedule[order.id] || []
      }))
    });
  });
  
  return report;
};

export const generateSummaryReport = (groupedPersonal, providers, workSchedule) => {
  const report = {
    available: [],
    warning: [],
    unavailable: [],
    unassigned: []
  };

  Object.values(groupedPersonal).forEach(person => {
    const provider = getProviderInfo(providers, person.ruc);
    
    // Calcular el estado general de la persona basado en todas sus órdenes
    const allAssignedMonths = [];
    person.orders.forEach(order => {
      const months = workSchedule[order.id] || [];
      allAssignedMonths.push(...months);
    });
    
    if (!provider) {
      report.unassigned.push({
        ...person,
        reason: 'Proveedor no registrado'
      });
      return;
    }

    const consecutiveMonths = getConsecutiveMonths(allAssignedMonths);
    const maxMonths = getMaxMonthsForType(provider.type);
    
    if (consecutiveMonths >= maxMonths) {
      report.unavailable.push({
        ...person,
        provider,
        consecutiveMonths,
        maxMonths,
        reason: 'Límite de meses consecutivos alcanzado'
      });
    } else if (consecutiveMonths >= maxMonths - 1) {
      report.warning.push({
        ...person,
        provider,
        consecutiveMonths,
        maxMonths,
        reason: 'Cerca del límite de meses consecutivos'
      });
    } else {
      report.available.push({
        ...person,
        provider,
        consecutiveMonths,
        maxMonths,
        remainingMonths: maxMonths - consecutiveMonths
      });
    }
  });

  return report;
};

export const exportToExcel = (filteredReport, months) => {
  try {
    // Crear datos para exportar con caracteres limpios
    const exportData = filteredReport.map(item => ({
      'Semaforo': item.status === 'safe' ? 'Verde' : item.status === 'warning' ? 'Amarillo' : item.status === 'danger' ? 'Rojo' : 'Gris',
      'Nombre': item.personName,
      'RUC': item.personRuc,
      'Area': item.personArea,
      'Tipo Profesional': item.provider?.type || 'Sin clasificar',
      'Total Ordenes': item.totalOrders,
      'Ordenes Asignadas': item.assignedOrders,
      'Ordenes Pendientes': item.pendingOrders,
      'Meses Laborados': item.assignedMonths.map(m => months[m]).join('; '),
      'Meses Consecutivos': item.consecutiveMonths,
      'Limite Maximo': item.maxMonths,
      'Meses Restantes': item.remainingMonths,
      'Estado': item.statusText,
      'Monto Total': item.totalAmount,
      'Detalle Ordenes': item.orders.map(order => 
        `${order.orden} (${order.siaf}) - S/ ${order.monto}`
      ).join('; ')
    }));

    // Crear CSV con separador de punto y coma para Excel
    const csvContent = [
      Object.keys(exportData[0]).join(';'),
      ...exportData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && (value.includes(';') || value.includes(','))
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        ).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_personal_consolidado_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Reporte Excel exportado",
      description: `Se exportaron ${filteredReport.length} registros consolidados.`,
      variant: "default"
    });
  } catch (error) {
    toast({
      title: "Error al exportar Excel",
      description: "Hubo un problema al generar el archivo Excel.",
      variant: "destructive"
    });
  }
};

export const exportToPDF = (filteredReport) => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Título
    doc.setFontSize(16);
    doc.text('Reporte Consolidado de Personal - Sistema de Gestión', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 20, 30);
    doc.text(`Total de registros: ${filteredReport.length}`, 20, 37);
    
    // Preparar datos para la tabla
    const tableData = filteredReport.map(item => [
      item.status === 'safe' ? '🟢' : item.status === 'warning' ? '🟡' : item.status === 'danger' ? '🔴' : '⚪',
      item.personName,
      item.personRuc,
      item.personArea,
      item.provider?.type || 'Sin clasificar',
      item.totalOrders.toString(),
      item.assignedOrders.toString(),
      item.consecutiveMonths.toString(),
      item.maxMonths.toString(),
      item.statusText,
      `S/ ${item.totalAmount.toLocaleString('es-PE')}`
    ]);
    
    // Configurar tabla
    doc.autoTable({
      head: [['Semáforo', 'Nombre', 'RUC', 'Área', 'Tipo', 'Total Órdenes', 'Asignadas', 'Consecutivos', 'Límite', 'Estado', 'Monto Total']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontSize: 9
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 15 },
        8: { halign: 'center', cellWidth: 15 },
        9: { cellWidth: 25 },
        10: { halign: 'right', cellWidth: 25 }
      },
      margin: { top: 45, left: 10, right: 10 }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`reporte_personal_consolidado_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Reporte PDF exportado",
      description: `Se generó el PDF con ${filteredReport.length} registros consolidados.`,
      variant: "default"
    });
  } catch (error) {
    toast({
      title: "Error al exportar PDF",
      description: "Hubo un problema al generar el archivo PDF.",
      variant: "destructive"
    });
  }
};