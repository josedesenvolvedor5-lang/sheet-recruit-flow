import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Star,
  ArrowRight,
  Calendar
} from 'lucide-react';

interface CandidateTracking {
  id: string;
  name: string;
  position: string;
  currentStage: string;
  progress: number;
  status: 'active' | 'completed' | 'rejected';
  stages: {
    id: string;
    name: string;
    status: 'completed' | 'current' | 'pending';
    score?: number;
    feedback?: string;
    completedAt?: string;
  }[];
  notes: string[];
}

const TrackingPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // Dados simulados para demonstração
  const candidates: CandidateTracking[] = [
    {
      id: '1',
      name: 'Ana Silva',
      position: 'Desenvolvedor Frontend',
      currentStage: 'Entrevista Técnica',
      progress: 60,
      status: 'active',
      stages: [
        { id: '1', name: 'Triagem Inicial', status: 'completed', score: 85, completedAt: '2024-01-15' },
        { id: '2', name: 'Entrevista RH', status: 'completed', score: 90, completedAt: '2024-01-16' },
        { id: '3', name: 'Entrevista Técnica', status: 'current' },
        { id: '4', name: 'Teste Prático', status: 'pending' },
        { id: '5', name: 'Entrevista Final', status: 'pending' }
      ],
      notes: [
        'Excelente comunicação na entrevista de RH',
        'Conhecimento sólido em React e TypeScript'
      ]
    },
    {
      id: '2',
      name: 'Carlos Santos',
      position: 'Designer UX/UI',
      currentStage: 'Teste Prático',
      progress: 80,
      status: 'active',
      stages: [
        { id: '1', name: 'Triagem Inicial', status: 'completed', score: 95, completedAt: '2024-01-14' },
        { id: '2', name: 'Entrevista RH', status: 'completed', score: 88, completedAt: '2024-01-15' },
        { id: '3', name: 'Entrevista Técnica', status: 'completed', score: 92, completedAt: '2024-01-16' },
        { id: '4', name: 'Teste Prático', status: 'current' },
        { id: '5', name: 'Entrevista Final', status: 'pending' }
      ],
      notes: [
        'Portfolio impressionante',
        'Experiência em design systems'
      ]
    }
  ];

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.currentStage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'current':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary text-primary-foreground">Ativo</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Finalizado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento de Candidatos</h1>
          <p className="text-muted-foreground">Monitore o progresso detalhado de cada candidato</p>
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Candidatos */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Candidatos em Processo</h2>
          {filteredCandidates.map((candidate) => (
            <Card 
              key={candidate.id} 
              className={`cursor-pointer shadow-card hover:shadow-elevated transition-all duration-300 ${
                selectedCandidate === candidate.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCandidate(candidate.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{candidate.name}</h3>
                  {getStatusBadge(candidate.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{candidate.position}</p>
                <p className="text-sm font-medium mb-3">{candidate.currentStage}</p>
                <Progress value={candidate.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{candidate.progress}% concluído</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detalhes do Candidato */}
        <div className="lg:col-span-2">
          {selectedCandidate ? (
            (() => {
              const candidate = candidates.find(c => c.id === selectedCandidate);
              if (!candidate) return null;

              return (
                <div className="space-y-6">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {candidate.name}
                      </CardTitle>
                      <CardDescription>{candidate.position}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Progresso Geral</span>
                        <span className="text-sm text-muted-foreground">{candidate.progress}%</span>
                      </div>
                      <Progress value={candidate.progress} className="h-3" />
                    </CardContent>
                  </Card>

                  {/* Etapas */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Etapas do Processo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {candidate.stages.map((stage, index) => (
                          <div key={stage.id} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              {getStatusIcon(stage.status)}
                              {index < candidate.stages.length - 1 && (
                                <div className="w-px h-8 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium">{stage.name}</h4>
                                {stage.score && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium">{stage.score}%</span>
                                  </div>
                                )}
                              </div>
                              {stage.completedAt && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Concluído em {new Date(stage.completedAt).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              {stage.feedback && (
                                <p className="text-sm mt-2 p-2 bg-muted rounded">{stage.feedback}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notas e Comentários */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Notas e Comentários
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {candidate.notes.map((note, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{note}</p>
                        </div>
                      ))}
                      
                      <div className="space-y-2">
                        <Textarea placeholder="Adicionar nova nota..." rows={3} />
                        <Button size="sm" className="bg-gradient-primary text-white">
                          Adicionar Nota
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações */}
                  <Card className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Agendar Entrevista
                        </Button>
                        <Button variant="outline" size="sm">
                          Enviar Email
                        </Button>
                        <Button variant="outline" size="sm">
                          Atualizar Status
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-success hover:bg-success/90 text-success-foreground"
                        >
                          Avançar Etapa
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()
          ) : (
            <Card className="shadow-card h-96">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione um Candidato</h3>
                  <p className="text-muted-foreground">
                    Clique em um candidato à esquerda para ver seus detalhes
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPanel;