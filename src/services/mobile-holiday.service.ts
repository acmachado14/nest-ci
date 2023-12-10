export class MobileHolidayService {
  easterDate: string;
  carnavalDate: string;
  corpusChristiDate: string;
  holyFridayDate: string;

  constructor(year: number) {
    this.calculateMobileHolidayDate(year);
  }

  private calculateMobileHolidayDate(year: number) {
    const easterDate = this.genEasterSunday(year);
    const carnavalDate = new Date(easterDate);
    const corpusChristiDate = new Date(easterDate);
    const holyFridayDate = new Date(easterDate);

    carnavalDate.setDate(easterDate.getDate() - 47);
    corpusChristiDate.setDate(easterDate.getDate() + 60);
    holyFridayDate.setDate(easterDate.getDate() - 2);

    this.easterDate = this.toString(easterDate);
    this.carnavalDate = this.toString(carnavalDate);
    this.corpusChristiDate = this.toString(corpusChristiDate);
    this.holyFridayDate = this.toString(holyFridayDate);
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
        name: 'Corpus Christi',
        date: this.corpusChristiDate,
      };
    }

    return null;
  }

  private toString(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  setCurrentYear(year: number) {
    this.calculateMobileHolidayDate(year);
  }
}
