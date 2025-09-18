import React, { useState, useEffect } from 'react';
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
  Activity,
  Plus
} from 'lucide-react';
import { useFirebase } from '@/hooks/useFirebase';
import type { Batch } from '@/hooks/useFirebase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BatchData extends Batch {
  stages?: StageProgress[];
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
  const { getBatches, addBatch, deleteBatch } = useFirebase();
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: '',
    jobTitle: '',
    status: 'planned' as const,
    startDate: '',
    endDate: '',
    maxCandidates: 0,
    currentCandidates: 0,
    completionRate: 0,
    averageTime: 0
  });

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoading(true);
        const batchesData = await getBatches();
        setBatches(batchesData);
        if (batchesData.length > 0 && !selectedBatch) {
          setSelectedBatch(batchesData[0].id || '');
        }
      } catch (error) {
        console.error('Error loading batches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  const handleAddBatch = async () => {
    try {
      await addBatch(newBatch);
      setIsAddDialogOpen(false);
      setNewBatch({
        name: '',
        jobTitle: '',
        status: 'planned',
        startDate: '',
        endDate: '',
        maxCandidates: 0,
        currentCandidates: 0,
        completionRate: 0,
        averageTime: 0
      });
      // Reload batches
      const batchesData = await getBatches();
      setBatches(batchesData);
    } catch (error) {
      console.error('Error adding batch:', error);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      await deleteBatch(batchId);
      // Reload batches
      const batchesData = await getBatches();
      setBatches(batchesData);
      if (selectedBatch === batchId && batchesData.length > 0) {
        setSelectedBatch(batchesData[0].id || '');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Carregando lotes...</div>
        </div>
      </div>
    );
  }

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Lote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lote</DialogTitle>
                <DialogDescription>
                  Crie um novo lote de seleção para organizar candidatos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Nome do lote"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="jobTitle" className="text-right">
                    Vaga
                  </Label>
                  <Input
                    id="jobTitle"
                    value={newBatch.jobTitle}
                    onChange={(e) => setNewBatch({ ...newBatch, jobTitle: e.target.value })}
                    className="col-span-3"
                    placeholder="Título da vaga"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Data Início
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    Data Fim
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newBatch.endDate}
                    onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxCandidates" className="text-right">
                    Máx. Candidatos
                  </Label>
                  <Input
                    id="maxCandidates"
                    type="number"
                    value={newBatch.maxCandidates}
                    onChange={(e) => setNewBatch({ ...newBatch, maxCandidates: Number(e.target.value) })}
                    className="col-span-3"
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddBatch}>Adicionar Lote</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
          {batches.length > 0 && (
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione um lote" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id || ''}>
                    <div>
                      <div className="font-medium">{batch.name}</div>
                      <div className="text-xs text-muted-foreground">{batch.jobTitle}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
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
                      value={currentBatch.maxCandidates > 0 ? (currentBatch.currentCandidates / currentBatch.maxCandidates) * 100 : 0} 
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

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Lote</CardTitle>
                <CardDescription>
                  Ações disponíveis para este lote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteBatch(currentBatch.id || '')}
                  >
                    Excluir Lote
                  </Button>
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