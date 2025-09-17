import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  Building,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/hooks/useFirebase';

interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'intern';
  level: 'junior' | 'mid' | 'senior' | 'lead';
  salary: string;
  requirements: string;
  benefits: string;
  isActive: boolean;
  createdAt: string;
  applications: number;
}

interface Batch {
  id: string;
  name: string;
  jobId: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  maxCandidates: number;
  currentCandidates: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  description: string;
}

const JobsPanel = () => {
  const { toast } = useToast();
  const { addJob, getJobs, updateJob, deleteJob } = useFirebase();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [batches, setBatches] = useState<Batch[]>([
    {
      id: '1',
      name: 'Lote Frontend Q1 2024',
      jobId: '1',
      jobTitle: 'Desenvolvedor Frontend React',
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      maxCandidates: 20,
      currentCandidates: 15,
      status: 'active',
      description: 'Processo seletivo para desenvolvedores frontend'
    },
    {
      id: '2',
      name: 'Lote RH Expansion',
      jobId: '2',
      jobTitle: 'Analista de RH Sênior',
      startDate: '2024-02-15',
      endDate: '2024-03-15',
      maxCandidates: 10,
      currentCandidates: 8,
      status: 'active',
      description: 'Expansão do time de recursos humanos'
    }
  ]);

  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    type: 'full-time' as Job['type'],
    level: 'mid' as Job['level'],
    salary: '',
    requirements: '',
    benefits: ''
  });

  const [batchFormData, setBatchFormData] = useState({
    name: '',
    jobId: '',
    startDate: '',
    endDate: '',
    maxCandidates: 10,
    description: ''
  });

  // Carregar vagas do Firebase
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await getJobs();
        const formattedJobs = jobsData.map(job => ({
          id: job.id!,
          title: job.title,
          description: job.description,
          department: job.department || '',
          location: job.location || '',
          type: job.type,
          level: job.level || 'mid',
          salary: job.salary || '',
          requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : '',
          benefits: job.benefits || '',
          isActive: job.status === 'open',
          createdAt: job.createdAt.toISOString().split('T')[0],
          applications: 0 // Pode ser calculado posteriormente
        }));
        setJobs(formattedJobs);
      } catch (error) {
        console.error('Erro ao carregar vagas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar vagas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []); // Removidas as dependências para evitar loop

  const typeLabels = {
    'full-time': 'Integral',
    'part-time': 'Meio período',
    'contract': 'Contrato',
    'intern': 'Estágio'
  };

  const levelLabels = {
    'junior': 'Júnior',
    'mid': 'Pleno',
    'senior': 'Sênior',
    'lead': 'Lead'
  };

  const statusLabels = {
    'planned': 'Planejado',
    'active': 'Ativo',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  };

  const statusColors = {
    'planned': 'default',
    'active': 'default',
    'completed': 'secondary',
    'cancelled': 'destructive'
  } as const;

  const handleCreateJob = async () => {
    if (!jobFormData.title.trim()) {
      toast({
        title: "Erro",
        description: "Título da vaga é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const jobData = {
        title: jobFormData.title,
        description: jobFormData.description,
        department: jobFormData.department,
        location: jobFormData.location,
        type: jobFormData.type,
        level: jobFormData.level,
        salary: jobFormData.salary,
        requirements: jobFormData.requirements.split(',').map(req => req.trim()).filter(req => req),
        benefits: jobFormData.benefits,
        status: 'open' as const
      };

      if (editingJob) {
        await updateJob(editingJob.id, jobData);
        const updatedJobs = jobs.map(job => 
          job.id === editingJob.id ? { ...job, ...jobFormData, isActive: true } : job
        );
        setJobs(updatedJobs);
        toast({
          title: "Sucesso",
          description: "Vaga atualizada com sucesso"
        });
      } else {
        const newJobId = await addJob(jobData);
        const newJob: Job = {
          id: newJobId,
          ...jobFormData,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
          applications: 0
        };
        setJobs([...jobs, newJob]);
        toast({
          title: "Sucesso",
          description: "Vaga criada com sucesso"
        });
      }

      setJobFormData({ title: '', description: '', department: '', location: '', type: 'full-time', level: 'mid', salary: '', requirements: '', benefits: '' });
      setEditingJob(null);
      setIsJobDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar vaga",
        variant: "destructive"
      });
    }
  };

  const handleCreateBatch = () => {
    if (!batchFormData.name.trim() || !batchFormData.jobId) {
      toast({
        title: "Erro",
        description: "Nome do lote e vaga são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedJob = jobs.find(job => job.id === batchFormData.jobId);
    const newBatch: Batch = {
      id: Date.now().toString(),
      ...batchFormData,
      jobTitle: selectedJob?.title || '',
      currentCandidates: 0,
      status: 'planned'
    };

    setBatches([...batches, newBatch]);
    setBatchFormData({ name: '', jobId: '', startDate: '', endDate: '', maxCandidates: 10, description: '' });
    setIsBatchDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Lote criado com sucesso"
    });
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast({
        title: "Sucesso",
        description: "Vaga removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar vaga",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    setBatches(batches.filter(batch => batch.id !== batchId));
    toast({
      title: "Sucesso",
      description: "Lote removido com sucesso"
    });
  };

  const openJobDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setJobFormData({
        title: job.title,
        description: job.description,
        department: job.department,
        location: job.location,
        type: job.type,
        level: job.level,
        salary: job.salary,
        requirements: job.requirements,
        benefits: job.benefits
      });
    } else {
      setEditingJob(null);
      setJobFormData({ title: '', description: '', department: '', location: '', type: 'full-time', level: 'mid', salary: '', requirements: '', benefits: '' });
    }
    setIsJobDialogOpen(true);
  };

  const openBatchDialog = (batch?: Batch) => {
    if (batch) {
      setEditingBatch(batch);
      setBatchFormData({
        name: batch.name,
        jobId: batch.jobId,
        startDate: batch.startDate,
        endDate: batch.endDate,
        maxCandidates: batch.maxCandidates,
        description: batch.description
      });
    } else {
      setEditingBatch(null);
      setBatchFormData({ name: '', jobId: '', startDate: '', endDate: '', maxCandidates: 10, description: '' });
    }
    setIsBatchDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vagas e Lotes</h2>
          <p className="text-muted-foreground">Gerencie vagas de emprego e organize lotes de seleção</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">Vagas</TabsTrigger>
          <TabsTrigger value="batches">Lotes</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openJobDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Vaga
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingJob ? 'Editar' : 'Nova'} Vaga</DialogTitle>
                  <DialogDescription>
                    {editingJob ? 'Edite as informações da vaga' : 'Configure uma nova vaga de emprego'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título da Vaga</Label>
                    <Input
                      id="title"
                      value={jobFormData.title}
                      onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                      placeholder="Ex: Desenvolvedor Frontend React"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        value={jobFormData.department}
                        onChange={(e) => setJobFormData({...jobFormData, department: e.target.value})}
                        placeholder="Ex: Tecnologia"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={jobFormData.location}
                        onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                        placeholder="Ex: São Paulo - SP"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={jobFormData.type} onValueChange={(value: Job['type']) => setJobFormData({...jobFormData, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="level">Nível</Label>
                      <Select value={jobFormData.level} onValueChange={(value: Job['level']) => setJobFormData({...jobFormData, level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(levelLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="salary">Faixa Salarial</Label>
                    <Input
                      id="salary"
                      value={jobFormData.salary}
                      onChange={(e) => setJobFormData({...jobFormData, salary: e.target.value})}
                      placeholder="Ex: R$ 8.000 - R$ 12.000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={jobFormData.description}
                      onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                      placeholder="Descreva a vaga e suas responsabilidades"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="requirements">Requisitos</Label>
                    <Textarea
                      id="requirements"
                      value={jobFormData.requirements}
                      onChange={(e) => setJobFormData({...jobFormData, requirements: e.target.value})}
                      placeholder="Liste os requisitos necessários"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="benefits">Benefícios</Label>
                    <Textarea
                      id="benefits"
                      value={jobFormData.benefits}
                      onChange={(e) => setJobFormData({...jobFormData, benefits: e.target.value})}
                      placeholder="Descreva os benefícios oferecidos"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateJob}>
                    {editingJob ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando vagas...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma vaga cadastrada</p>
              </div>
            ) : (
              jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="w-4 h-4" />
                            {job.department}
                            <MapPin className="w-4 h-4 ml-2" />
                            {job.location}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{typeLabels[job.type]}</Badge>
                        <Badge variant="outline">{levelLabels[job.level]}</Badge>
                        <Badge variant={job.isActive ? "default" : "secondary"}>
                          {job.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{job.applications} candidaturas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Criada em {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openJobDialog(job)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openBatchDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingBatch ? 'Editar' : 'Novo'} Lote</DialogTitle>
                  <DialogDescription>
                    {editingBatch ? 'Edite as informações do lote' : 'Configure um novo lote de seleção'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="batch-name">Nome do Lote</Label>
                    <Input
                      id="batch-name"
                      value={batchFormData.name}
                      onChange={(e) => setBatchFormData({...batchFormData, name: e.target.value})}
                      placeholder="Ex: Lote Frontend Q1 2024"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="job-select">Vaga</Label>
                    <Select value={batchFormData.jobId} onValueChange={(value) => setBatchFormData({...batchFormData, jobId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma vaga" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-date">Data Início</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={batchFormData.startDate}
                        onChange={(e) => setBatchFormData({...batchFormData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-date">Data Fim</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={batchFormData.endDate}
                        onChange={(e) => setBatchFormData({...batchFormData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max-candidates">Máx. Candidatos</Label>
                    <Input
                      id="max-candidates"
                      type="number"
                      min="1"
                      value={batchFormData.maxCandidates}
                      onChange={(e) => setBatchFormData({...batchFormData, maxCandidates: parseInt(e.target.value) || 10})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="batch-description">Descrição</Label>
                    <Textarea
                      id="batch-description"
                      value={batchFormData.description}
                      onChange={(e) => setBatchFormData({...batchFormData, description: e.target.value})}
                      placeholder="Descreva o objetivo deste lote"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateBatch}>
                    {editingBatch ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {batches.map((batch) => (
              <Card key={batch.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{batch.name}</h3>
                          <p className="text-sm text-muted-foreground">{batch.jobTitle}</p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{batch.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant={statusColors[batch.status]}>
                          {statusLabels[batch.status]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{batch.currentCandidates}/{batch.maxCandidates} candidatos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBatchDialog(batch)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobsPanel;