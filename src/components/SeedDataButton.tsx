import React from 'react';
import { seedInitialData } from '@/lib/seedData';

export const SeedDataButton = () => {
  const handleSeed = async () => {
    if (window.confirm('Deseja adicionar dados de exemplo? (Execute apenas uma vez)')) {
      await seedInitialData();
      alert('Dados de exemplo adicionados com sucesso!');
    }
  };

  return (
    <button 
      onClick={handleSeed}
      className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 transition-colors text-sm z-50"
    >
      Seed Data (Dev)
    </button>
  );
};