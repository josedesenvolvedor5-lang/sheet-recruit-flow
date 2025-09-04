import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Link, 
  Unlink, 
  Target, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock,
  Settings,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stage {
  id: string;
  name: string;
  type: 'screening' | 'interview' | 'test' | 'assessment' | 'final';
  duration: number;
  isActive: boolean;
}

interface Batch {
  id: string;
  name: string;
  jobTitle: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

interface Assignment {
  id: string;
  batchId: string;
  stageId: string;
  batchName: string;
  stageName: string;
  jobTitle: string;
  order: number;
  isActive: boolean;
}

const AssignPanel = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      batchId: '1',
      stageId: '1',
      batchName: 'Lote Frontend Q1 2024',
      stageName: 'Triagem Inicial',
      jobTitle: 'Desenvolvedor Frontend React',
      order: 1,
      isActive: true
    },
    {
      id: '2',
      batchId: '1',
      stageId: '2',
      batchName: 'Lote Frontend Q1 2024',
      stageName: 'Entrevista com RH',
      jobTitle: 'Desenvolvedor Frontend React',
      order: 2,
      isActive: true
    },
    {
      id: '3',
      batchId: '1',
      stageId: '3',
      batchName: 'Lote Frontend Q1 2024',
      stageName: 'Teste Técnico',
      jobTitle: 'Desenvolvedor Frontend React',
      order: 3,
      isActive: true
    }
  ]);

  // Mock data - would come from other components
  const stages: Stage[] = [
    { id: '1', name: 'Triagem Inicial', type: 'screening', duration: 2, isActive: true },
    { id: '2', name: 'Entrevista com RH', type: 'interview', duration: 5, isActive: true },
    { id: '3', name: 'Teste Técnico', type: 'test', duration: 7, isActive: true },
    { id: '4', name: 'Entrevista Técnica', type: 'interview', duration: 3, isActive: true },
    { id: '5', name: 'Aprovação Final', type: 'final', duration: 2, isActive: true }
  ];

  const batches: Batch[] = [
    { id: '1', name: 'Lote Frontend Q1 2024', jobTitle: 'Desenvolvedor Frontend React', status: 'active' },
    { id: '2', name: 'Lote RH Expansion', jobTitle: 'Analista de RH Sênior', status: 'active' }
  ];

  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const stageTypeIcons = {
    screening: FileText,
    interview: Users,
    test: CheckCircle,
    assessment: Clock,
    final: CheckCircle
  };

  const stageTypeLabels = {
    screening: 'Triagem',
    interview: 'Entrevista',
    test: 'Teste',
    assessment: 'Avaliação',
    final: 'Final'
  };

  const statusColors = {
    planned: 'default',
    active: 'default',
    completed: 'secondary',
    cancelled: 'destructive'
  } as const;

  const handleAssignStages = () => {
    if (!selectedBatch || selectedStages.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um lote e pelo menos uma etapa",
        variant: "destructive"
      });
      return;
    }

    const batch = batches.find(b => b.id === selectedBatch);
    if (!batch) return;

    const newAssignments = selectedStages.map((stageId, index) => {
      const stage = stages.find(s => s.id === stageId);
      if (!stage) return null;

      return {
        id: `${selectedBatch}-${stageId}`,
        batchId: selectedBatch,
        stageId: stageId,
        batchName: batch.name,
        stageName: stage.name,
        jobTitle: batch.jobTitle,
        order: index + 1,
        isActive: true
      };
    }).filter(Boolean) as Assignment[];

    // Remove existing assignments for this batch
    const filteredAssignments = assignments.filter(a => a.batchId !== selectedBatch);
    
    // Add new assignments
    setAssignments([...filteredAssignments, ...newAssignments]);

    setSelectedBatch('');
    setSelectedStages([]);
    setIsDialogOpen(false);

    toast({
      title: "Sucesso",
      description: `${newAssignments.length} etapas atribuídas ao lote`
    });
  };

  const handleRemoveAssignment = (batchId: string, stageId: string) => {
    setAssignments(assignments.filter(a => !(a.batchId === batchId && a.stageId === stageId)));
    toast({
      title: "Sucesso",
      description: "Etapa removida do lote"
    });
  };

  const handleToggleStage = (stageId: string) => {
    setSelectedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const getAssignmentsByBatch = () => {
    const grouped = assignments.reduce((acc, assignment) => {
      if (!acc[assignment.batchId]) {
        acc[assignment.batchId] = [];
      }
      acc[assignment.batchId].push(assignment);
      return acc;
    }, {} as Record<string, Assignment[]>);

    // Sort stages within each batch by order
    Object.keys(grouped).forEach(batchId => {
      grouped[batchId].sort((a, b) => a.order - b.order);
    });

    return grouped;
  };

  const assignmentsByBatch = getAssignmentsByBatch();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Atribuir Etapas</h2>
          <p className="text-muted-foreground">Vincule etapas do processo aos lotes de seleção</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link className="w-4 h-4 mr-2" />
              Atribuir Etapas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Atribuir Etapas ao Lote</DialogTitle>
              <DialogDescription>
                Selecione o lote e as etapas que devem ser aplicadas
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Lote</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um lote" />
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

              <div className="grid gap-2">
                <label className="text-sm font-medium">Etapas</label>
                <div className="border rounded-md p-3 space-y-3 max-h-60 overflow-y-auto">
                  {stages.filter(stage => stage.isActive).map((stage) => {
                    const Icon = stageTypeIcons[stage.type];
                    return (
                      <div key={stage.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={stage.id}
                          checked={selectedStages.includes(stage.id)}
                          onCheckedChange={() => handleToggleStage(stage.id)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <label htmlFor={stage.id} className="text-sm font-medium cursor-pointer">
                            {stage.name}
                          </label>
                          <Badge variant="outline" className="text-xs">
                            {stageTypeLabels[stage.type]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedStages.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedStages.length} etapa(s) selecionada(s)
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAssignStages}>
                Atribuir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Object.keys(assignmentsByBatch).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Settings className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma etapa atribuída</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece atribuindo etapas aos lotes de seleção
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(assignmentsByBatch).map(([batchId, batchAssignments]) => {
            const batch = batches.find(b => b.id === batchId);
            if (!batch) return null;

            return (
              <Card key={batchId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{batch.name}</CardTitle>
                        <CardDescription>{batch.jobTitle}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={statusColors[batch.status]}>
                      {batch.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      Processo de Seleção ({batchAssignments.length} etapas)
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {batchAssignments.map((assignment, index) => {
                        const stage = stages.find(s => s.id === assignment.stageId);
                        if (!stage) return null;
                        
                        const Icon = stageTypeIcons[stage.type];
                        
                        return (
                          <div key={assignment.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                                <span className="text-xs font-medium">{index + 1}</span>
                              </div>
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{assignment.stageName}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAssignment(assignment.batchId, assignment.stageId)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Unlink className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            {index < batchAssignments.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-muted-foreground">
                        Duração total estimada: {batchAssignments.reduce((acc, assignment) => {
                          const stage = stages.find(s => s.id === assignment.stageId);
                          return acc + (stage?.duration || 0);
                        }, 0)} dias
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBatch(batchId);
                          setSelectedStages(batchAssignments.map(a => a.stageId));
                          setIsDialogOpen(true);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(assignmentsByBatch).length}</div>
                <div className="text-sm text-muted-foreground">Lotes Configurados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <div className="text-sm text-muted-foreground">Etapas Atribuídas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(assignments.reduce((acc, assignment) => {
                    const stage = stages.find(s => s.id === assignment.stageId);
                    return acc + (stage?.duration || 0);
                  }, 0) / Math.max(Object.keys(assignmentsByBatch).length, 1))}
                </div>
                <div className="text-sm text-muted-foreground">Duração Média (dias)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignPanel;