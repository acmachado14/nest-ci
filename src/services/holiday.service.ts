import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MobileHolidayService } from './mobile-holiday.service';

const prisma = new PrismaClient();

export enum LocationType {
  State = 'state',
  City = 'city',
  National = 'national',
}

@Injectable()
export class HolidayService {
  mobileHolidayService: MobileHolidayService;

  constructor() {
    this.mobileHolidayService = new MobileHolidayService(
      parseInt(process.env.CURRENT_YEAR, 10),
    );
  }

  private async findHolidayByDate(date: string) {
    const holiday = await prisma.holiday.findFirst({
      where: {
        date,
      },
    });

    if (holiday) {
      return holiday;
    }

    return null;
  }

  async findRegionByCodigoIBGE(codigoIBGE: string) {
    const codigoIBGEInt = parseInt(codigoIBGE, 10);

    const findState = async () => {
      const state = await prisma.state.findFirst({
        where: {
          id: codigoIBGEInt,
        },
      });

      if (!state) {
        throw new NotFoundException('Estado não encontrado');
      }

      return state;
    };

    const findCity = async () => {
      const city = await prisma.city.findFirst({
        where: {
          id: codigoIBGEInt,
        },
      });

      if (!city) {
        throw new NotFoundException('Cidade não encontrada');
      }

      return city;
    };

    if (codigoIBGE.length === 2) {
      return findState();
    }

    return findCity();
  }

  private async getStateHoliday(codigoIBGE: string, data: string) {
    const codigoIBGEInt = parseInt(codigoIBGE, 10);
    try {
      const holiday = await this.findHolidayByDate(data);

      if (holiday) {
        return {
          id: holiday.id,
          name: holiday.name,
          date: holiday.date,
          type: LocationType.National,
        };
      }

      const stateHoliday = await prisma.stateHoliday.findFirst({
        where: {
          idState: codigoIBGEInt,
          date: data,
        },
      });

      if (stateHoliday) {
        return {
          id: stateHoliday.id,
          name: stateHoliday.name,
          date: stateHoliday.date,
          type: LocationType.State,
        };
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private async getCityHoliday(codigoIBGE: string, data: string) {
    const codigoIBGEInt = parseInt(codigoIBGE, 10);
    try {
      const holiday = await this.findHolidayByDate(data);

      if (holiday) {
        return {
          id: holiday.id,
          name: holiday.name,
          date: holiday.date,
          type: LocationType.National,
        };
      }

      const cityHoliday = await prisma.cityHoliday.findFirst({
        where: {
          idCity: codigoIBGEInt,
          date: data,
        },
      });

      if (cityHoliday) {
        return {
          id: cityHoliday.id,
          name: cityHoliday.name,
          date: cityHoliday.date,
          type: LocationType.City,
        };
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getHoliday(IBGECode: string, date: string) {
    const newDate = date.substring(5, 10);
    if (IBGECode.length === 7) {
      let cityHoliday = await this.getCityHoliday(IBGECode, date);
      let stateHoliday = await this.getStateHoliday(
        IBGECode.substring(0, 2),
        date,
      );

      if (cityHoliday) {
        return cityHoliday;
      }

      if (stateHoliday) {
        return stateHoliday;
      }

      //only with MM-DD
      cityHoliday = await this.getCityHoliday(IBGECode, newDate);
      stateHoliday = await this.getStateHoliday(
        IBGECode.substring(0, 2),
        newDate,
      );

      if (cityHoliday) {
        return cityHoliday;
      }

      if (stateHoliday) {
        return stateHoliday;
      }
    } else {
      let stateHoliday = await this.getStateHoliday(IBGECode, date);

      if (stateHoliday) {
        return stateHoliday;
      }

      //only with MM-DD
      stateHoliday = await this.getStateHoliday(IBGECode, newDate);

      if (stateHoliday) {
        return stateHoliday;
      }
    }

    return null;
  }

  private async createStateHoliday(
    codigoIBGEInt: number,
    data: string,
    name: string,
  ) {
    const holiday = await prisma.stateHoliday.create({
      data: {
        idState: codigoIBGEInt,
        date: data,
        name: name,
      },
    });

    return holiday;
  }

  private async createCityHoliday(
    codigoIBGEInt: number,
    data: string,
    name: string,
  ) {
    const holiday = await prisma.cityHoliday.create({
      data: {
        idCity: codigoIBGEInt,
        date: data,
        name: name,
      },
    });

    return holiday;
  }

  async createHoliday(codigoIBGE: string, data: string, name: string) {
    console.log(data);
    const codigoIBGEInt = parseInt(codigoIBGE, 10);
    const result =
      codigoIBGE.length === 2
        ? await this.createStateHoliday(codigoIBGEInt, data, name)
        : await this.createCityHoliday(codigoIBGEInt, data, name);

    return result;
  }

  async renameHoliday(codigoIBGE: string, date: string, newName: string) {
    const codigoIBGEInt = parseInt(codigoIBGE, 10);
    if (codigoIBGE.length === 2) {
      const stateHolidayToUpdate = await prisma.stateHoliday.findFirst({
        where: { idState: codigoIBGEInt, date: date },
      });

      const updatedHoliday = await prisma.stateHoliday.update({
        where: { id: stateHolidayToUpdate.id },
        data: { name: newName },
      });

      return updatedHoliday;
    }

    const cityHolidayToUpdate = await prisma.cityHoliday.findFirst({
      where: { idCity: codigoIBGEInt },
    });

    const updatedHoliday = await prisma.cityHoliday.update({
      where: { id: cityHolidayToUpdate.id },
      data: { name: newName },
    });

    return updatedHoliday;
  }

  async removeHoliday(id: number, type: LocationType) {
    if (type == LocationType.State) {
      await prisma.stateHoliday.delete({
        where: { id },
      });

      return true;
    }

    if (type == LocationType.City) {
      await prisma.cityHoliday.delete({
        where: { id },
      });

      return true;
    }

    return false;
  }

  async removeByNameAndCode(name: string, codigoIBGE: string) {
    const codigoIBGEInt = parseInt(codigoIBGE, 10);
    if (codigoIBGE.length === 2) {
      await prisma.stateHoliday.deleteMany({
        where: { idState: codigoIBGEInt, name: name },
      });

      return true;
    }

    await prisma.cityHoliday.deleteMany({
      where: { idCity: codigoIBGEInt, name: name },
    });

    return false;
  }
}
