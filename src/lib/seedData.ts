import { useFirebase } from '@/hooks/useFirebase';

export const seedInitialData = async () => {
  const firebase = useFirebase();

  // Seed some jobs
  const jobsData = [
    {
      title: 'Desenvolvedor Frontend React',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      type: 'full-time' as const,
      status: 'open' as const,
      description: 'Desenvolvedor frontend com experiência em React, TypeScript e Tailwind CSS.',
      requirements: ['React', 'TypeScript', 'Tailwind CSS', 'Git'],
      salary: 'R$ 8.000 - R$ 12.000'
    },
    {
      title: 'Designer UX/UI',
      department: 'Design',
      location: 'Rio de Janeiro, RJ',
      type: 'full-time' as const,
      status: 'open' as const,
      description: 'Designer experiente em UX/UI para produtos digitais.',
      requirements: ['Figma', 'Adobe Creative Suite', 'Prototipagem', 'Design System'],
      salary: 'R$ 6.000 - R$ 10.000'
    },
    {
      title: 'Analista de Marketing Digital',
      department: 'Marketing',
      location: 'Belo Horizonte, MG',
      type: 'full-time' as const,
      status: 'open' as const,
      description: 'Analista de marketing digital com foco em campanhas e métricas.',
      requirements: ['Google Analytics', 'Facebook Ads', 'Google Ads', 'SEO'],
      salary: 'R$ 5.000 - R$ 8.000'
    }
  ];

  // Seed stages
  const stagesData = [
    {
      name: 'Análise de Currículo',
      description: 'Primeira análise do currículo e perfil do candidato',
      order: 1,
      duration: 2
    },
    {
      name: 'Entrevista com RH',  
      description: 'Entrevista inicial com o time de recursos humanos',
      order: 2,
      duration: 3
    },
    {
      name: 'Teste Técnico',
      description: 'Avaliação técnica específica da área',
      order: 3,
      duration: 5
    },
    {
      name: 'Entrevista Técnica',
      description: 'Entrevista com o time técnico e gestor da área',
      order: 4,
      duration: 2
    },
    {
      name: 'Proposta',
      description: 'Apresentação da proposta final ao candidato',
      order: 5,
      duration: 3
    }
  ];

  // Seed candidates
  const candidatesData = [
    {
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      phone: '(11) 99999-1111',
      location: 'São Paulo, SP',
      position: 'Desenvolvedor Frontend React',
      experience: '5 anos de experiência em desenvolvimento frontend com React',
      motivation: 'Busco novos desafios em uma empresa inovadora',
      status: 'reviewing' as const,
      currentStage: 'Entrevista Técnica'
    },
    {
      name: 'Carlos Santos',
      email: 'carlos.santos@email.com',
      phone: '(21) 99999-2222',
      location: 'Rio de Janeiro, RJ',
      position: 'Designer UX/UI',
      experience: '3 anos em design de produtos digitais',
      motivation: 'Quero contribuir com produtos que impactam positivamente a vida das pessoas',
      status: 'reviewing' as const,
      currentStage: 'Teste Técnico'
    },
    {
      name: 'Maria Oliveira',
      email: 'maria.oliveira@email.com',
      phone: '(31) 99999-3333',
      location: 'Belo Horizonte, MG',
      position: 'Analista de Marketing Digital',
      experience: '4 anos em marketing digital e performance',
      motivation: 'Busco uma oportunidade para expandir meus conhecimentos',
      status: 'pending' as const,
      currentStage: 'Análise de Currículo'
    }
  ];

  try {
    console.log('Seeding jobs...');
    for (const job of jobsData) {
      await firebase.addJob(job);
    }

    console.log('Seeding stages...');
    let stageIds: string[] = [];
    for (const stage of stagesData) {
      const stageId = await firebase.addStage(stage);
      stageIds.push(stageId);
    }

    console.log('Seeding candidates...');
    for (const candidate of candidatesData) {
      const candidateId = await firebase.addCandidate(candidate);
      
      // Add some sample notes
      if (candidate.name === 'Ana Silva') {
        await firebase.addCandidateNote({
          candidateId,
          note: 'Excelente comunicação na entrevista de RH'
        });
        await firebase.addCandidateNote({
          candidateId,
          note: 'Conhecimento sólido em React e TypeScript'
        });
        
        // Update some stages to completed
        const stages = await firebase.getCandidateStages(candidateId);
        if (stages.length >= 3) {
          await firebase.updateCandidateStage(stages[0].id!, {
            status: 'completed',
            score: 85,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          });
          await firebase.updateCandidateStage(stages[1].id!, {
            status: 'completed',
            score: 90,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          });
        }
      }
      
      if (candidate.name === 'Carlos Santos') {
        await firebase.addCandidateNote({
          candidateId,
          note: 'Portfolio impressionante'
        });
        await firebase.addCandidateNote({
          candidateId,
          note: 'Experiência em design systems'
        });
        
        // Update stages to completed
        const stages = await firebase.getCandidateStages(candidateId);
        if (stages.length >= 4) {
          await firebase.updateCandidateStage(stages[0].id!, {
            status: 'completed',
            score: 95,
            completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          });
          await firebase.updateCandidateStage(stages[1].id!, {
            status: 'completed',
            score: 88,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          });
          await firebase.updateCandidateStage(stages[2].id!, {
            status: 'completed',
            score: 92,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          });
        }
      }
    }

    console.log('Initial data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};