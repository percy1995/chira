
import React from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import PersonalManagementSystem from '@/components/PersonalManagementSystem';

function App() {
  return (
    <>
      <Helmet>
        <title>Sistema de Gestión de Personal - Control de Meses Laborados</title>
        <meta name="description" content="Sistema para controlar y gestionar los meses laborados del personal según órdenes de servicio" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <PersonalManagementSystem />
        <Toaster />
      </div>
    </>
  );
}

export default App;
