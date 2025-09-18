import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  MapPin,
  TrendingUp,
  Target,
  Briefcase
} from 'lucide-react';
import { useFirebase } from '@/hooks/useFirebase';

const Dashboard: React.FC = () => {
  const { getDashboardStats } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: { totalCandidates: 0, approved: 0, rejected: 0, pending: 0 },
    regionData: [],
    processStages: [],
    totalJobs: 0,
    activeJobs: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Carregando dashboard...</div>
        </div>
      </div>
    );
  }

  const { stats, regionData, processStages, totalJobs, activeJobs } = dashboardData;
  const approvalRate = stats.totalCandidates > 0 ? Math.round((stats.approved / stats.totalCandidates) * 100) : 0;
  const pendingRate = stats.totalCandidates > 0 ? Math.round((stats.pending / stats.totalCandidates) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Recrutamento</h1>
        <p className="text-blue-100">Visão geral do processo seletivo em tempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total de Candidatos</p>
                <p className="text-3xl font-bold">{stats.totalCandidates}</p>
              </div>
              <div className="bg-accent p-3 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Aprovados</p>
                <p className="text-3xl font-bold text-success">{stats.approved}</p>
              </div>
              <div className="bg-success-light p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Rejeitados</p>
                <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <UserX className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pendentes</p>
                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
              </div>
              <div className="bg-warning-light p-3 rounded-full">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Vagas Ativas</p>
                <p className="text-3xl font-bold text-primary">{activeJobs}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Região */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Candidatos por Região
            </CardTitle>
            <CardDescription>
              Distribuição geográfica dos candidatos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionData.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{region.region}</span>
                    <Badge variant="secondary">{region.candidates} candidatos</Badge>
                  </div>
                  <Progress value={region.percentage} className="h-2" />
                  <p className="text-sm text-muted-foreground text-right">{region.percentage}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funil de Contratação */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Funil de Contratação
            </CardTitle>
            <CardDescription>
              Progresso dos candidatos por etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {processStages.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <Badge variant="outline">{stage.candidates} candidatos</Badge>
                  </div>
                  <Progress value={stage.completion} className="h-2" />
                  <p className="text-sm text-muted-foreground text-right">
                    {stage.completion}% de conclusão
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de Conversão */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-success rounded-lg text-white">
              <p className="text-2xl font-bold">{approvalRate}%</p>
              <p className="text-sm opacity-90">Taxa de Aprovação</p>
            </div>
            <div className="text-center p-4 bg-gradient-primary rounded-lg text-white">
              <p className="text-2xl font-bold">{totalJobs}</p>
              <p className="text-sm opacity-90">Total de Vagas</p>
            </div>
            <div className="text-center p-4 bg-yellow-500 rounded-lg text-white">
              <p className="text-2xl font-bold">{pendingRate}%</p>
              <p className="text-sm opacity-90">Taxa de Pendência</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;