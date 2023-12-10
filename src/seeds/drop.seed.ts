import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.cityHoliday.deleteMany({});
    await prisma.stateHoliday.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.state.deleteMany({});
    await prisma.holiday.deleteMany({});
    console.log('Dados removidos com sucesso.');
  } catch (error) {
    console.error('Erro ao remover dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
