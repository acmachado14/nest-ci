export class MobileHolidayService {
  easterDate: Date;
  carnavalDate: Date;
  corpusChristiDate: Date;
  holyFridayDate: Date;

  constructor(year: number) {
    this.easterDate = this.genEasterSunday(year);
    this.carnavalDate = new Date(this.easterDate);
    this.corpusChristiDate = new Date(this.easterDate);
    this.holyFridayDate = new Date(this.easterDate);

    this.carnavalDate.setDate(this.easterDate.getDate() - 47);
    this.corpusChristiDate.setDate(this.easterDate.getDate() + 60);
    this.holyFridayDate.setDate(this.easterDate.getDate() - 2);
  }

  private genEasterSunday(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  getHolidayInfoByName(name: string) {
    if (name == 'carnaval') {
      return {
        name: 'Feriado de Carnaval',
        date: this.carnavalDate,
      };
    }

    if (name == 'corpus-christi') {
      return {
        name: 'Feriado Corpus Christi',
        date: this.corpusChristiDate,
      };
    }

    return null;
  }
}
