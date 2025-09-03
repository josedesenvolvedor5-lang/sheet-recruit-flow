import React from 'react';
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
  Target
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Dados simulados para demonstração
  const stats = {
    totalCandidates: 247,
    approved: 89,
    rejected: 42,
    pending: 116
  };

  const regionData = [
    { region: 'São Paulo', candidates: 89, percentage: 36 },
    { region: 'Rio de Janeiro', candidates: 62, percentage: 25 },
    { region: 'Minas Gerais', candidates: 43, percentage: 17 },
    { region: 'Outros', candidates: 53, percentage: 22 }
  ];

  const processStages = [
    { stage: 'Triagem', candidates: 116, completion: 70 },
    { stage: 'Entrevista', candidates: 78, completion: 85 },
    { stage: 'Teste Técnico', candidates: 45, completion: 60 },
    { stage: 'Finalização', candidates: 28, completion: 95 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Recrutamento</h1>
        <p className="text-blue-100">Visão geral do processo seletivo em tempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-2xl font-bold">36%</p>
              <p className="text-sm opacity-90">Taxa de Aprovação</p>
            </div>
            <div className="text-center p-4 bg-gradient-primary rounded-lg text-white">
              <p className="text-2xl font-bold">7.2 dias</p>
              <p className="text-sm opacity-90">Tempo Médio do Processo</p>
            </div>
            <div className="text-center p-4 bg-yellow-500 rounded-lg text-white">
              <p className="text-2xl font-bold">47%</p>
              <p className="text-sm opacity-90">Taxa de Pendência</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;