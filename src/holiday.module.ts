import { Module } from '@nestjs/common';
import { HolidayController } from './controllers/holiday.controller';
import { HolidayService } from './services/holiday.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Module({
  controllers: [HolidayController],
  providers: [HolidayService, { provide: 'PRISMA', useValue: prisma }],
})
export class HolidayModule {}
