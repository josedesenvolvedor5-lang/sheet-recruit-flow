import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/hooks/useFirebase';
import { useToast } from '@/hooks/use-toast';

const FirebaseTest: React.FC = () => {
  const { addCandidate, getCandidates } = useFirebase();
  const { toast } = useToast();

  const testConnection = async () => {
    try {
      toast({ title: "Testando conexão...", description: "Verificando Firebase" });
      
      // Teste: adicionar candidato
      const testCandidate = {
        name: "João Teste",
        email: "joao.teste@email.com",
        phone: "(11) 99999-9999",
        location: "São Paulo, SP",
        position: "Desenvolvedor Frontend",
        experience: "Experiência de teste",
        motivation: "Motivação de teste",
        resumeUrl: "https://example.com/curriculo.pdf",
        status: 'pending' as const,
        currentStage: "Análise de Currículo"
      };
      
      await addCandidate(testCandidate);
      
      // Teste: buscar candidatos
      const candidates = await getCandidates();
      console.log('Candidatos encontrados:', candidates);
      
      toast({ 
        title: "Teste concluído!", 
        description: `Firebase conectado. ${candidates.length} candidatos no banco.` 
      });
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({ 
        title: "Erro no teste", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Teste Firebase</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testConnection} className="w-full">
          Testar Conexão
        </Button>
      </CardContent>
    </Card>
  );
};

export default FirebaseTest;