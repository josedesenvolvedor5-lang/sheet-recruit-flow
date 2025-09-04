import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Eye,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface BatchData {
  id: string;
  name: string;
  jobTitle: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  maxCandidates: number;
  currentCandidates: number;
  stages: StageProgress[];
  completionRate: number;
  averageTime: number;
}

interface StageProgress {
  id: string;
  name: string;
  type: 'screening' | 'interview' | 'test' | 'assessment' | 'final';
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  averageDuration: number;
}

interface CandidateInStage {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  stageId: string;
  stageName: string;
  entryDate: string;
  duration?: number;
}

const BatchesPanel = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>('1');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const batches: BatchData[] = [
    {
      id: '1',
      name: 'Lote Frontend Q1 2024',
      jobTitle: 'Desenvolvedor Frontend React',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      maxCandidates: 20,
      currentCandidates: 15,
      completionRate: 65,
      averageTime: 12,
      stages: [
        {
          id: '1',
          name: 'Triagem Inicial',
          type: 'screening',
          total: 15,
          approved: 12,
          rejected: 2,
          pending: 1,
          averageDuration: 2
        },
        {
          id: '2',
          name: 'Entrevista com RH',
          type: 'interview',
          total: 12,
          approved: 9,
          rejected: 2,
          pending: 1,
          averageDuration: 5
        },
        {
          id: '3',
          name: 'Teste Técnico',
          type: 'test',
          total: 9,
          approved: 6,
          rejected: 1,
          pending: 2,
          averageDuration: 7
        },
        {
          id: '4',
          name: 'Entrevista Técnica',
          type: 'interview',
          total: 6,
          approved: 4,
          rejected: 0,
          pending: 2,
          averageDuration: 3
        }
      ]
    },
    {
      id: '2',
      name: 'Lote RH Expansion',
      jobTitle: 'Analista de RH Sênior',
      status: 'active',
      startDate: '2024-02-15',
      endDate: '2024-03-15',
      maxCandidates: 10,
      currentCandidates: 8,
      completionRate: 40,
      averageTime: 8,
      stages: [
        {
          id: '1',
          name: 'Triagem Inicial',
          type: 'screening',
          total: 8,
          approved: 6,
          rejected: 1,
          pending: 1,
          averageDuration: 2
        },
        {
          id: '2',
          name: 'Entrevista com RH',
          type: 'interview',
          total: 6,
          approved: 4,
          rejected: 1,
          pending: 1,
          averageDuration: 4
        }
      ]
    }
  ];

  const candidatesInStages: CandidateInStage[] = [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana@email.com',
      status: 'pending',
      stageId: '3',
      stageName: 'Teste Técnico',
      entryDate: '2024-02-20',
      duration: 3
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@email.com',
      status: 'approved',
      stageId: '4',
      stageName: 'Entrevista Técnica',
      entryDate: '2024-02-22',
      duration: 1
    },
    {
      id: '3',
      name: 'Maria Oliveira',
      email: 'maria@email.com',
      status: 'pending',
      stageId: '1',
      stageName: 'Triagem Inicial',
      entryDate: '2024-02-25'
    }
  ];

  const statusLabels = {
    'planned': 'Planejado',
    'active': 'Ativo',
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'all': 'Todos'
  };

  const statusColors = {
    'planned': 'default',
    'active': 'default',
    'completed': 'secondary',
    'cancelled': 'destructive'
  } as const;

  const stageTypeIcons = {
    screening: Filter,
    interview: Users,
    test: CheckCircle,
    assessment: Clock,
    final: CheckCircle
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return AlertCircle;
      case 'pending': return Clock;
      default: return Activity;
    }
  };

  const filteredBatches = selectedStatus === 'all' 
    ? batches 
    : batches.filter(batch => batch.status === selectedStatus);

  const currentBatch = batches.find(b => b.id === selectedBatch);

  const calculateApprovalRate = (stage: StageProgress) => {
    const completed = stage.approved + stage.rejected;
    return completed > 0 ? (stage.approved / completed) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Visualizar Lotes</h2>
          <p className="text-muted-foreground">Acompanhe o progresso dos lotes de seleção</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  <div>
                    <div className="font-medium">{batch.name}</div>
                    <div className="text-xs text-muted-foreground">{batch.jobTitle}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filteredBatches.length}</div>
                <div className="text-sm text-muted-foreground">Lotes Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredBatches.reduce((acc, batch) => acc + batch.currentCandidates, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Candidatos Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(filteredBatches.reduce((acc, batch) => acc + batch.completionRate, 0) / Math.max(filteredBatches.length, 1))}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa Média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(filteredBatches.reduce((acc, batch) => acc + batch.averageTime, 0) / Math.max(filteredBatches.length, 1))}
                </div>
                <div className="text-sm text-muted-foreground">Dias Médios</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Details */}
      {currentBatch && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="stages">Etapas</TabsTrigger>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{currentBatch.name}</CardTitle>
                      <CardDescription>{currentBatch.jobTitle}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={statusColors[currentBatch.status]}>
                    {statusLabels[currentBatch.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Período</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(currentBatch.startDate).toLocaleDateString()} - {new Date(currentBatch.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Candidatos</div>
                    <div className="text-2xl font-bold">
                      {currentBatch.currentCandidates}/{currentBatch.maxCandidates}
                    </div>
                    <Progress 
                      value={(currentBatch.currentCandidates / currentBatch.maxCandidates) * 100} 
                      className="w-full h-2" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Progresso</div>
                    <div className="text-2xl font-bold">{currentBatch.completionRate}%</div>
                    <Progress value={currentBatch.completionRate} className="w-full h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Tempo Médio</div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">{currentBatch.averageTime}</span>
                      <span className="text-sm text-muted-foreground">dias</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stages" className="space-y-4">
            <div className="grid gap-4">
              {currentBatch.stages.map((stage, index) => {
                const Icon = stageTypeIcons[stage.type];
                const approvalRate = calculateApprovalRate(stage);
                
                return (
                  <Card key={stage.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-semibold">{stage.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stage.total} candidatos • {stage.averageDuration} dias médios
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{Math.round(approvalRate)}%</div>
                          <div className="text-xs text-muted-foreground">Aprovação</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-blue-600">{stage.total}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-green-600">{stage.approved}</div>
                          <div className="text-xs text-muted-foreground">Aprovados</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-red-600">{stage.rejected}</div>
                          <div className="text-xs text-muted-foreground">Rejeitados</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-yellow-600">{stage.pending}</div>
                          <div className="text-xs text-muted-foreground">Pendentes</div>
                        </div>
                      </div>

                      <Progress 
                        value={stage.total > 0 ? ((stage.approved + stage.rejected) / stage.total) * 100 : 0} 
                        className="w-full h-2 mt-4" 
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Candidatos Ativos no Processo
                </CardTitle>
                <CardDescription>
                  Candidatos atualmente em diferentes etapas do processo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidatesInStages.map((candidate) => {
                    const StatusIcon = getStatusIcon(candidate.status);
                    return (
                      <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-sm text-muted-foreground">{candidate.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium">{candidate.stageName}</div>
                            <div className="text-xs text-muted-foreground">
                              Desde {new Date(candidate.entryDate).toLocaleDateString()}
                              {candidate.duration && ` • ${candidate.duration} dias`}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(candidate.status)}`} />
                            <Badge variant="outline" className={getStatusColor(candidate.status)}>
                              {candidate.status === 'approved' ? 'Aprovado' : 
                               candidate.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                            </Badge>
                          </div>

                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BatchesPanel;