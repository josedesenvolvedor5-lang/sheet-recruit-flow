import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  Clock, 
  Users, 
  FileText,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useFirebase } from '@/hooks/useFirebase';
import type { Stage } from '@/hooks/useFirebase';

const StagesPanel = () => {
  const { addStage, getStages, updateStage, deleteStage } = useFirebase();
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 1,
    duration: 1
  });

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      setLoading(true);
      const stagesData = await getStages();
      setStages(stagesData);
    } catch (error) {
      console.error('Error loading stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const stageTypeLabels = {
    screening: 'Triagem',
    interview: 'Entrevista',
    test: 'Teste',
    assessment: 'Avaliação',
    final: 'Final'
  };

  const stageTypeIcons = {
    screening: FileText,
    interview: Users,
    test: CheckCircle,
    assessment: Clock,
    final: CheckCircle
  };

  const handleCreateStage = async () => {
    if (!formData.name.trim()) return;

    try {
      await addStage({
        name: formData.name,
        description: formData.description,
        order: stages.length + 1,
        duration: formData.duration
      });
      
      setFormData({ name: '', description: '', order: 1, duration: 1 });
      setIsDialogOpen(false);
      await loadStages();
    } catch (error) {
      console.error('Error creating stage:', error);
    }
  };

  const handleEditStage = async () => {
    if (!editingStage || !formData.name.trim()) return;

    try {
      await updateStage(editingStage.id!, {
        name: formData.name,
        description: formData.description,
        duration: formData.duration
      });
      
      setEditingStage(null);
      setIsDialogOpen(false);
      await loadStages();
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      await deleteStage(stageId);
      await loadStages();
    } catch (error) {
      console.error('Error deleting stage:', error);
    }
  };

  const moveStage = async (stageId: string, direction: 'up' | 'down') => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    if (
      (direction === 'up' && stageIndex === 0) || 
      (direction === 'down' && stageIndex === stages.length - 1)
    ) return;

    const newStages = [...stages];
    const targetIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;
    
    [newStages[stageIndex], newStages[targetIndex]] = [newStages[targetIndex], newStages[stageIndex]];
    
    // Update order numbers and save to Firebase
    try {
      for (let i = 0; i < newStages.length; i++) {
        await updateStage(newStages[i].id!, { order: i + 1 });
      }
      await loadStages();
    } catch (error) {
      console.error('Error updating stage order:', error);
    }
  };

  const openEditDialog = (stage: Stage) => {
    setEditingStage(stage);
    setFormData({
      name: stage.name,
      description: stage.description || '',
      order: stage.order,
      duration: stage.duration
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingStage(null);
    setFormData({ name: '', description: '', order: 1, duration: 1 });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Carregando etapas...</div>
        </div>
      </div>
    );
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Etapas do Processo</h2>
          <p className="text-muted-foreground">Configure as etapas do processo seletivo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Etapa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingStage ? 'Editar' : 'Nova'} Etapa</DialogTitle>
              <DialogDescription>
                {editingStage ? 'Edite as informações da etapa' : 'Configure uma nova etapa do processo'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Etapa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Entrevista com RH"
                />
              </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duração (dias)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva o objetivo desta etapa"
                  />
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingStage ? handleEditStage : handleCreateStage}>
                {editingStage ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sortedStages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma etapa configurada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando a primeira etapa do seu processo seletivo
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedStages.map((stage, index) => {
            return (
              <Card key={stage.id} className="transition-all">{/* Removed opacity conditional since isActive doesn't exist */}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStage(stage.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStage(stage.id, 'down')}
                            disabled={index === sortedStages.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{stage.name}</h3>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {stage.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Duração: {stage.duration} dia(s)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(stage)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStage(stage.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {sortedStages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Resumo do Processo
            </CardTitle>
            <CardDescription>
              Visão geral das etapas configuradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{sortedStages.length}</div>
                <div className="text-sm text-muted-foreground">Total de Etapas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sortedStages.reduce((acc, stage) => acc + stage.duration, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Duração Total (dias)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StagesPanel;