import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
