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
  private mobileHolidayService: MobileHolidayService;

  constructor() {
    this.mobileHolidayService = new MobileHolidayService(
      new Date().getFullYear(),
    );
  }

  private async findHolidayByDate(date: Date) {
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
      const holiday = await this.findHolidayByDate(new Date(data));

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
          date: new Date(data),
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
      const holiday = await this.findHolidayByDate(new Date(data));

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
          date: new Date(data),
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
    if (IBGECode.length === 7) {
      const cityHoliday = await this.getCityHoliday(IBGECode, date);
      const stateHoliday = await this.getStateHoliday(
        IBGECode.substring(0, 2),
        date,
      );

      if (cityHoliday) {
        return cityHoliday;
      }

      if (stateHoliday) {
        return stateHoliday;
      }
    } else {
      const stateHoliday = await this.getStateHoliday(IBGECode, date);

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
        date: new Date(data),
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
        date: new Date(data),
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
        where: { idState: codigoIBGEInt, date: new Date(date) },
      });

      const updatedHoliday = await prisma.stateHoliday.update({
        where: { id: stateHolidayToUpdate.id },
        data: { name: newName },
      });

      return {
        name: updatedHoliday.name,
      };
    }

    const cityHolidayToUpdate = await prisma.cityHoliday.findFirst({
      where: { idCity: codigoIBGEInt },
    });

    const updatedHoliday = await prisma.cityHoliday.update({
      where: { id: cityHolidayToUpdate.id },
      data: { name: newName },
    });

    return {
      name: updatedHoliday.name,
    };
  }

  async removeHoliday(id: number, type: LocationType) {
    switch (type) {
      case LocationType.National:
        await prisma.holiday.delete({
          where: { id },
        });
      case LocationType.State:
        await prisma.stateHoliday.delete({
          where: { id },
        });
      case LocationType.City:
        await prisma.cityHoliday.delete({
          where: { id },
        });
    }
    return true;
  }

  async createHolidayByName(name: string) {}
}
