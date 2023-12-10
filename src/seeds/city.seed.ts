import { createReadStream } from 'fs';
import * as csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCities() {
  const filePath = 'municipios-2019.csv';

  const readStream = createReadStream(filePath);

  readStream
    .pipe(csv())
    .on('data', async (row) => {
      const idState = parseInt(row.codigo_ibge.substring(0, 2), 10);
      const cityData = {
        id: parseInt(row.codigo_ibge, 10),
        name: row.nome,
        idState: idState,
      };

      await prisma.city.create({
        data: cityData,
      });
    })
    .on('end', () => {
      console.log('Seed de cidades concluído com sucesso.');
      prisma.$disconnect();
    });
}

async function seed() {
  try {
    await seedCities();
  } catch (error) {
    console.error('Erro ao executar a seed de feriados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
