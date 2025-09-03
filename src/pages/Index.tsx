import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/hr/Layout';
import Dashboard from '@/components/hr/Dashboard';
import CandidatesPanel from '@/components/hr/CandidatesPanel';
import TrackingPanel from '@/components/hr/TrackingPanel';
import PublicForm from '@/components/hr/PublicForm';

const Index = () => {
  const [currentView, setCurrentView] = useState<'admin' | 'public'>('public');
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderAdminContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'candidates':
        return <CandidatesPanel />;
      case 'tracking':
        return <TrackingPanel />;
      case 'jobs':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Vagas e Lotes</h2>
            <p className="text-muted-foreground">Em desenvolvimento - Gerencie vagas e organize lotes</p>
          </div>
        );
      case 'stages':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Etapas do Processo</h2>
            <p className="text-muted-foreground">Em desenvolvimento - Configure etapas do processo seletivo</p>
          </div>
        );
      case 'assign':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Atribuir Etapas</h2>
            <p className="text-muted-foreground">Em desenvolvimento - Vincule etapas aos lotes</p>
          </div>
        );
      case 'batches':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Visualizar Lotes</h2>
            <p className="text-muted-foreground">Em desenvolvimento - Visualize progresso por lotes</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (currentView === 'public') {
    return (
      <div>
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            onClick={() => setCurrentView('admin')}
            className="bg-white/90 backdrop-blur-sm"
          >
            Painel Admin
          </Button>
        </div>
        <PublicForm />
      </div>
    );
  }

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => setCurrentView('public')}
          className="float-right"
        >
          Ver Formulário Público
        </Button>
      </div>
      {renderAdminContent()}
    </Layout>
  );
};

export default Index;