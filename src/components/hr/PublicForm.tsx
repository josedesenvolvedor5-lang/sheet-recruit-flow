import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/hooks/useFirebase';
import heroImage from '@/assets/hr-hero-image.jpg';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Upload, 
  Send,
  CheckCircle,
  Building2
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  position: string;
  experience: string;
  motivation: string;
  resume?: File;
}

const PublicForm: React.FC = () => {
  const { toast } = useToast();
  const { addCandidate, uploadResume } = useFirebase();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    position: '',
    experience: '',
    motivation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, resume: file }));
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos PDF.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.position) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Criar dados do candidato
      const candidateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: `${formData.city}${formData.state ? `, ${formData.state}` : ''}`,
        position: formData.position,
        experience: formData.experience,
        motivation: formData.motivation,
        status: 'pending' as const,
        currentStage: 'Análise de Currículo'
      };

      // Adicionar candidato ao Firebase
      const candidateId = await addCandidate(candidateData);

      // Upload do currículo se fornecido
      if (formData.resume && candidateId) {
        await uploadResume(formData.resume, candidateId);
      }
      
      setIsSubmitted(true);
      toast({
        title: "Inscrição realizada com sucesso!",
        description: "Obrigado por se candidatar. Entraremos em contato em breve."
      });
    } catch (error) {
      console.error('Erro no envio:', error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar sua inscrição. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elevated">
          <CardContent className="p-8 text-center">
            <div className="bg-success-light p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-success">Inscrição Enviada!</h2>
            <p className="text-muted-foreground mb-6">
              Sua candidatura foi recebida com sucesso. Nossa equipe de RH analisará 
              seu perfil e entraremos em contato em breve.
            </p>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '', email: '', phone: '', city: '', state: '', 
                  position: '', experience: '', motivation: ''
                });
              }}
              className="bg-gradient-primary text-white"
            >
              Nova Candidatura
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative bg-gradient-hero rounded-lg p-8 text-white mb-6 overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-800/80" />
            
            {/* Content */}
            <div className="relative z-10">
              <Building2 className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">Trabalhe Conosco</h1>
              <p className="text-xl text-blue-100">
                Junte-se à nossa equipe e faça parte do nosso crescimento
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Formulário de Candidatura
            </CardTitle>
            <CardDescription>
              Preencha todos os campos para se candidatar às nossas vagas abertas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
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

              {/* Vaga e Experiência */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Vaga de Interesse *</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a vaga desejada" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experiência Profissional</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Descreva sua experiência profissional relevante..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Por que deseja trabalhar conosco?</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="Conte-nos sobre sua motivação..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Upload de Currículo */}
              <div className="space-y-2">
                <Label htmlFor="resume">Currículo (PDF)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="resume" className="cursor-pointer">
                    {formData.resume ? (
                      <span className="text-success font-medium">{formData.resume.name}</span>
                    ) : (
                      <>
                        <span className="font-medium">Clique para enviar seu currículo</span>
                        <p className="text-sm text-muted-foreground mt-1">Apenas arquivos PDF (máx. 5MB)</p>
                      </>
                    )}
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-primary text-white shadow-card hover:shadow-elevated transition-all duration-300"
                size="lg"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Candidatura
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground">
          <p>Ao enviar este formulário, você concorda com nossos termos de privacidade.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicForm;