import React from 'react';
import Navigation from '@/components/navigation/Navigation';
import { PatrimonyDashboard } from '@/components/patrimony/PatrimonyDashboard';

const Patrimonio = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle Patrimonial</h1>
            <p className="text-muted-foreground">
              Gerencie seus ativos, passivos e acompanhe seu patrimônio líquido
            </p>
          </div>
          
          <PatrimonyDashboard />
        </div>
      </main>
    </div>
  );
};

export default Patrimonio;