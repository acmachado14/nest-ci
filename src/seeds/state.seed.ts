import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedStates() {
  const statesData = [
    { id: 12, acronym: 'AC' },
    { id: 27, acronym: 'AL' },
    { id: 16, acronym: 'AP' },
    { id: 13, acronym: 'AM' },
    { id: 29, acronym: 'BA' },
    { id: 23, acronym: 'CE' },
    { id: 53, acronym: 'DF' },
    { id: 32, acronym: 'ES' },
    { id: 52, acronym: 'GO' },
    { id: 21, acronym: 'MA' },
    { id: 51, acronym: 'MT' },
    { id: 50, acronym: 'MS' },
    { id: 31, acronym: 'MG' },
    { id: 15, acronym: 'PA' },
    { id: 25, acronym: 'PB' },
    { id: 41, acronym: 'PR' },
    { id: 26, acronym: 'PE' },
    { id: 22, acronym: 'PI' },
    { id: 33, acronym: 'RJ' },
    { id: 24, acronym: 'RN' },
    { id: 43, acronym: 'RS' },
    { id: 11, acronym: 'RO' },
    { id: 14, acronym: 'RR' },
    { id: 42, acronym: 'SC' },
    { id: 35, acronym: 'SP' },
    { id: 28, acronym: 'SE' },
    { id: 17, acronym: 'TO' },
  ];

  for (const stateData of statesData) {
    await prisma.state.create({
      data: {
        id: stateData.id,
        acronym: stateData.acronym,
      },
    });
  }

  console.log('Seed de estados concluído com sucesso.');
}

async function seed() {
  try {
    await seedStates();
  } catch (error) {
    console.error('Erro ao executar o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
