import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';

import { CreateHolidayDto } from './dtos/create-holiday.dto';
import { HolidayService, LocationType } from '../services/holiday.service';

@Controller('feriados')
export class HolidayController {
  private readonly HolidayService: HolidayService;

  constructor() {
    this.HolidayService = new HolidayService();
  }

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
    @Body() body: CreateHolidayDto,
  ) {
    const yearRange = parseInt(process.env.YEAR_RANGE, 10);
    await this.validateAndFindRegion(codigoIBGE);

    const isHolidayName = /[a-zA-Z]/.test(data);
    if (isHolidayName) {
      const holiday =
        this.HolidayService.mobileHolidayService.getHolidayInfoByName(data);

      const result = await this.HolidayService.getHoliday(
        codigoIBGE,
        holiday.date,
      );

      if (result != null) {
        return {
          name: result.name,
        };
      }

      //Crio o feriado para os proximos anos
      let currentYear = parseInt(process.env.CURRENT_YEAR, 10);
      let createdHoliday = null;
      for (let i = 0; i < yearRange; i++) {
        const newHoliday =
          this.HolidayService.mobileHolidayService.getHolidayInfoByName(data);

        createdHoliday = await this.HolidayService.createHoliday(
          codigoIBGE,
          newHoliday.date,
          newHoliday.name,
        );

        currentYear = currentYear + 1;
        this.HolidayService.mobileHolidayService.setCurrentYear(currentYear);
      }

      return {
        name: createdHoliday.name,
        message: `Feriado criado para os próximos ${yearRange} anos!`,
      };
    }

    if (!body.name) {
      throw new BadRequestException('Atributo name precisa estar preecnhido!');
    }

    this.validateRequest(data);
    const holiday = await this.HolidayService.getHoliday(codigoIBGE, data);

    if (holiday) {
      if (holiday.type == LocationType.National) {
        throw new ForbiddenException(
          'Não é possivel alterar um feriado nacional!',
        );
      }

      if (codigoIBGE.length === 7 && holiday.type == LocationType.State) {
        throw new ForbiddenException(
          'Não é possivel alterar um feriado do estado de a partir de uma cidade!',
        );
      }

      const result = await this.HolidayService.renameHoliday(
        codigoIBGE,
        data,
        body.name,
      );

      return {
        name: result.name,
        message: 'Feriado renomeado com sucesso!',
      };
    }

    let currentYear = parseInt(process.env.CURRENT_YEAR, 10);
    let createdHoliday = null;
    for (let i = 0; i < yearRange; i++) {
      createdHoliday = await this.HolidayService.createHoliday(
        codigoIBGE,
        `${currentYear}-${data}`,
        body.name,
      );
      currentYear = currentYear + 1;
    }

    return {
      name: createdHoliday.name,
      message: `Feriado criado para os próximos ${yearRange} anos!`,
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
      const holiday =
        this.HolidayService.mobileHolidayService.getHolidayInfoByName(date);

      const result = await this.HolidayService.getHoliday(
        IBGECode,
        holiday.date,
      );

      if (result == null) {
        throw new NotFoundException('Feriado não cadastrado!');
      }

      if (result.type == LocationType.National) {
        throw new ForbiddenException(
          'Não é possivel remover um feriado nacional!',
        );
      }

      if (IBGECode.length === 7 && result.type == LocationType.State) {
        throw new ForbiddenException(
          'Não é possivel remover um feriado do estado apartir de uma cidade!',
        );
      }

      return await this.HolidayService.removeByNameAndCode(
        result.name,
        IBGECode,
      );
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

      return await this.HolidayService.removeByNameAndCode(
        holiday.name,
        IBGECode,
      );
    }

    throw new NotFoundException('Feriado não encontrado');
  }

  private formatDate(date: string) {
    const actualYear = new Date().getFullYear();
    const completeDate = `${actualYear}-${date}`;
    return completeDate;
  }
}
