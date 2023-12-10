import { NestFactory } from '@nestjs/core';
import { HolidayModule } from './holiday.module';

async function bootstrap() {
  const app = await NestFactory.create(HolidayModule);
  await app.listen(3000);
}
bootstrap();
