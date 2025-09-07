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

  try {
    console.log('Seeding jobs...');
    for (const job of jobsData) {
      await firebase.addJob(job);
    }

    console.log('Seeding stages...');
    for (const stage of stagesData) {
      await firebase.addStage(stage);
    }

    console.log('Initial data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};