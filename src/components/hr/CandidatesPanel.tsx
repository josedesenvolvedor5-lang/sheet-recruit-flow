import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  User,
  Plus
} from 'lucide-react';
import { useFirebase } from '@/hooks/useFirebase';

const CandidatesPanel: React.FC = () => {
  const { useCandidatesRealtime, updateCandidate, deleteCandidate, addCandidate } = useFirebase();
  const { candidates, loading } = useCandidatesRealtime();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    position: '',
    experience: '',
    motivation: '',
    resumeUrl: ''
  });

  const availablePositions = [
    'Desenvolvedor Frontend',
    'Desenvolvedor Backend', 
    'Desenvolvedor Fullstack',
    'Designer UX/UI',
    'Analista de Marketing',
    'Gerente de Projetos',
    'Analista de Dados',
    'DevOps Engineer'
  ];

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'reviewing':
        return <Badge className="bg-primary text-primary-foreground">Em Análise</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: 'approved' | 'rejected' | 'reviewing') => {
    try {
      await updateCandidate(candidateId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      try {
        await deleteCandidate(candidateId);
      } catch (error) {
        console.error('Erro ao excluir candidato:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.position) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor, insira um email válido.');
      setIsSubmitting(false);
      return;
    }

    try {
      const candidateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        location: `${formData.city}${formData.state ? `, ${formData.state}` : ''}`.trim(),
        position: formData.position,
        experience: formData.experience.trim(),
        motivation: formData.motivation.trim(),
        resumeUrl: formData.resumeUrl.trim(),
        status: 'pending' as const,
        currentStage: 'Análise de Currículo'
      };

      await addCandidate(candidateData);
      
      // Resetar formulário
      setFormData({
        name: '', email: '', phone: '', city: '', state: '', 
        position: '', experience: '', motivation: '', resumeUrl: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar candidato:', error);
      alert('Erro ao adicionar candidato. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando candidatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Candidatos</h1>
          <p className="text-muted-foreground">Gerencie todos os candidatos inscritos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-white shadow-card">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Candidato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Candidato</DialogTitle>
                <DialogDescription>
                  Preencha os dados do candidato para adicionar ao sistema.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Nome Completo *</Label>
                    <Input
                      id="add-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-email">E-mail *</Label>
                    <Input
                      id="add-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-phone">Telefone *</Label>
                    <Input
                      id="add-phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-city">Cidade</Label>
                    <Input
                      id="add-city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-state">Estado</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {brazilianStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-position">Vaga *</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a vaga" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-experience">Experiência</Label>
                  <Textarea
                    id="add-experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Experiência profissional..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-motivation">Motivação</Label>
                  <Textarea
                    id="add-motivation"
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="Por que deseja trabalhar conosco..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-resumeUrl">URL do Currículo</Label>
                  <Input
                    id="add-resumeUrl"
                    type="url"
                    value={formData.resumeUrl}
                    onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-primary text-white"
                  >
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Candidato'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="shadow-card">
            <Download className="w-4 h-4 mr-2" />
            Exportar Lista
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou vaga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="reviewing">Em Análise</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{candidates.filter(c => c.status === 'pending').length}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{candidates.filter(c => c.status === 'reviewing').length}</p>
            <p className="text-sm text-muted-foreground">Em Análise</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{candidates.filter(c => c.status === 'approved').length}</p>
            <p className="text-sm text-muted-foreground">Aprovados</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{candidates.filter(c => c.status === 'rejected').length}</p>
            <p className="text-sm text-muted-foreground">Rejeitados</p>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold">{candidate.name}</h3>
                    {getStatusBadge(candidate.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {candidate.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {candidate.createdAt?.toLocaleDateString?.('pt-BR') || 'Data não disponível'}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium mt-2">Vaga: {candidate.position}</p>
                  <p className="text-sm text-muted-foreground mt-1">Etapa atual: {candidate.currentStage}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  {candidate.resumeUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        Currículo
                      </a>
                    </Button>
                  )}
                  
                  {candidate.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleStatusChange(candidate.id!, 'reviewing')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Analisar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleStatusChange(candidate.id!, 'approved')}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(candidate.id!, 'rejected')}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  
                  {candidate.status === 'reviewing' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleStatusChange(candidate.id!, 'approved')}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(candidate.id!, 'rejected')}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCandidate(candidate.id!)}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
            <p className="text-muted-foreground">
              {candidates.length === 0 
                ? "Ainda não há candidatos cadastrados. Aguarde novas inscrições."
                : "Tente ajustar os filtros de busca."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidatesPanel;