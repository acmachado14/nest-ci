import { PrismaClient } from '@prisma/client';
import { MobileHolidayService } from '../services/mobile-holiday.service';

const prisma = new PrismaClient();

async function seedHolidays() {
  const holidaysData = [
    { name: 'Ano Novo', date: '01-01' },
    { name: 'Tiradentes', date: '04-21' },
    { name: 'Dia do Trabalhador', date: '05-01' },
    { name: 'Independência', date: '09-07' },
    { name: 'Nossa Senhora Aparecida', date: '10-12' },
    { name: 'Finados', date: '11-02' },
    { name: 'Proclamação da República', date: '11-15' },
    { name: 'Natal', date: '12-25' },
  ];

  for (const holidayData of holidaysData) {
    await prisma.holiday.create({
      data: {
        name: holidayData.name,
        date: holidayData.date,
      },
    });
  }

  let currentYear = parseInt(process.env.CURRENT_YEAR, 10);
  const yearRange = parseInt(process.env.YEAR_RANGE, 10);
  for (let i = 0; i < yearRange; i++) {
    const mobileHoliday = new MobileHolidayService(currentYear);

    await prisma.holiday.create({
      data: {
        name: 'Sexta-Feira Santa',
        date: mobileHoliday.holyFridayDate,
      },
    });
    currentYear = currentYear + 1;
  }

  const consciousnessHolidays = [27, 16, 13, 51, 33, 35];
  for (const consciousnessHoliday of consciousnessHolidays) {
    await prisma.stateHoliday.create({
      data: {
        idState: consciousnessHoliday,
        date: '11-20',
        name: 'Consciência Negra',
      },
    });
  }

  await prisma.cityHoliday.create({
    data: {
      idCity: 1400100,
      date: '11-20',
      name: 'Consciência Negra',
    },
  });

  console.log('Seed de feriados concluído com sucesso.');
}

async function seed() {
  try {
    await seedHolidays();
  } catch (error) {
    console.error('Erro ao executar a seed de feriados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
