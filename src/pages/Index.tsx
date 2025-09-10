import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/hr/Layout';
import Dashboard from '@/components/hr/Dashboard';
import CandidatesPanel from '@/components/hr/CandidatesPanel';
import TrackingPanel from '@/components/hr/TrackingPanel';
import StagesPanel from '@/components/hr/StagesPanel';
import JobsPanel from '@/components/hr/JobsPanel';
import AssignPanel from '@/components/hr/AssignPanel';
import BatchesPanel from '@/components/hr/BatchesPanel';
import { SeedDataButton } from '@/components/SeedDataButton';
import FirebaseTest from '@/components/FirebaseTest';

const Index = () => {
  const [currentTab, setCurrentTab] = useState('candidates');

  const renderAdminContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'candidates':
        return <CandidatesPanel />;
      case 'tracking':
        return <TrackingPanel />;
      case 'jobs':
        return <JobsPanel />;
      case 'stages':
        return <StagesPanel />;
      case 'assign':
        return <AssignPanel />;
      case 'batches':
        return <BatchesPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <SeedDataButton />
        </div>
        <div className="absolute top-4 left-4 z-10">
          <FirebaseTest />
        </div>
      </div>
      {renderAdminContent()}
    </Layout>
  );
};

export default Index;