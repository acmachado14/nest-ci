import { IsString } from 'class-validator';

export class CreateHolidayDto {
  @IsString()
  name: string;
}
