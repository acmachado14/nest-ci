import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import { HolidayService, LocationType } from '../services/holiday.service';
import { CreateHolidayDto } from './dtos/create-holiday.dto';
import { MobileHolidayService } from 'src/services/mobile-holiday.service';

@Controller('feriados')
export class HolidayController {
  constructor(private readonly HolidayService: HolidayService) {}

  private async validateAndFindRegion(codigoIBGE: string) {
    if (codigoIBGE.length !== 2 && codigoIBGE.length !== 7) {
      throw new BadRequestException('Código IBGE deve ter 2 ou 7 caracteres');
    }

    try {
      const result =
        await this.HolidayService.findRegionByCodigoIBGE(codigoIBGE);
      return result;
    } catch (error) {
      throw error;
    }
  }

  private validateGetRequest(data: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data)) {
      throw new BadRequestException(
        'Formato de data inválido. Use "AAAA-MM-DD".',
      );
    }

    const [ano, mes, dia] = data.split('-').map(Number);
    const parsedDate = new Date(ano, mes - 1, dia);
    if (
      parsedDate.getFullYear() !== ano ||
      parsedDate.getMonth() !== mes - 1 ||
      parsedDate.getDate() !== dia
    ) {
      throw new BadRequestException(
        'Data inválida. Certifique-se de que o ano, mês e dia são valores válidos.',
      );
    }
  }

  private validateRequest(data: string): void {
    const dateRegex = /^\d{2}-\d{2}$/;
    if (!dateRegex.test(data)) {
      throw new BadRequestException('Formato de data inválido. Use "MM-DD".');
    }

    const anoAtual = new Date().getFullYear();
    const [mes, dia] = data.split('-').map(Number);
    const parsedDate = new Date(anoAtual, mes - 1, dia);
    if (parsedDate.getMonth() !== mes - 1 || parsedDate.getDate() !== dia) {
      throw new BadRequestException(
        'Data inválida. Certifique-se de que o mês e dia são valores válidos para o ano atual.',
      );
    }
  }

  @Get(':codigoIBGE/:data')
  async getHoliday(
    @Param('codigoIBGE') codigoIBGE: string,
    @Param('data') data: string,
  ) {
    this.validateGetRequest(data);

    await this.validateAndFindRegion(codigoIBGE);

    const result = await this.HolidayService.getHoliday(codigoIBGE, data);

    if (result === null) {
      throw new NotFoundException('Feriado não encontrado');
    }

    return {
      name: result.name,
    };
  }

  @Put(':codigoIBGE/:data')
  @HttpCode(201)
  async createHoliday(
    @Param('codigoIBGE') codigoIBGE: string,
    @Param('data') data: string,
    @Body(
      new ValidationPipe({
        transform: true,
        exceptionFactory: () => new BadRequestException('Dados inválidos'),
      }),
    )
    body: CreateHolidayDto,
  ) {
    await this.validateAndFindRegion(codigoIBGE);

    const isHolidayName = /[a-zA-Z]/.test(data);
    if (isHolidayName) {
      const mobileHoliday = new MobileHolidayService(new Date().getFullYear());
      const holiday = mobileHoliday.getHolidayInfoByName(data);

      const result = await this.HolidayService.getHoliday(
        codigoIBGE,
        holiday.date.toString(),
      );

      if (result != null) {
        return {
          name: result.name,
        };
      }

      const createdHoliday = await this.HolidayService.createHoliday(
        codigoIBGE,
        holiday.date.toString(),
        holiday.name,
      );

      return {
        name: createdHoliday.name,
      };
    }

    this.validateRequest(data);
    const completeDate = this.formatDate(data);
    const holiday = await this.HolidayService.getHoliday(
      codigoIBGE,
      completeDate,
    );

    if (holiday) {
      const result = await this.HolidayService.renameHoliday(
        codigoIBGE,
        completeDate,
        body.name,
      );
      return result;
    }

    const result = await this.HolidayService.createHoliday(
      codigoIBGE,
      completeDate,
      body.name,
    );

    return {
      name: result.name,
    };
  }

  @Delete(':IBGECode/:date')
  @HttpCode(204)
  async removerFeriado(
    @Param('IBGECode') IBGECode: string,
    @Param('date') date: string,
  ) {
    await this.validateAndFindRegion(IBGECode);
    const isHolidayName = /[a-zA-Z]/.test(date);
    if (isHolidayName) {
      const mobileHoliday = new MobileHolidayService(new Date().getFullYear());
      const holiday = mobileHoliday.getHolidayInfoByName(date);

      const result = await this.HolidayService.getHoliday(
        IBGECode,
        holiday.date.toString(),
      );

      if (result == null) {
        throw new NotFoundException('Feriado não cadastrado!');
      }

      return await this.HolidayService.removeHoliday(result.id, result.type);
    }

    this.validateRequest(date);

    const completeDate = this.formatDate(date);
    const holiday = await this.HolidayService.getHoliday(
      IBGECode,
      completeDate,
    );

    if (holiday) {
      if (holiday.type == LocationType.National) {
        throw new ForbiddenException(
          'Não é possivel remover um feriado nacional!',
        );
      }

      if (IBGECode.length === 7 && holiday.type == LocationType.State) {
        throw new ForbiddenException(
          'Não é possivel remover um feriado do estado de uma cidade!',
        );
      }

      return await this.HolidayService.removeHoliday(holiday.id, holiday.type);
    }

    throw new NotFoundException('Feriado não encontrado');
  }

  private formatDate(date: string) {
    const actualYear = new Date().getFullYear();
    const completeDate = `${actualYear}-${date}`;
    return completeDate;
  }
}
