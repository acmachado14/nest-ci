import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HolidayModule } from './../src/holiday.module';

describe('HolidayController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HolidayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return 200 and Dia do Trabalhador in Oiapoque', () => {
    return request(app.getHttpServer())
      .get('/feriados/1600501/2020-05-01')
      .expect(200)
      .expect({
        name: 'Dia do Trabalhador',
      });
  });

  it('should return 200 and Dia do Trabalhador in Chuí', () => {
    return request(app.getHttpServer())
      .get('/feriados/1600501/2020-05-01')
      .expect(200)
      .expect({
        name: 'Dia do Trabalhador',
      });
  });

  it('should not be able to delete a national holiday in a city (returns 403)', async () => {
    await request(app.getHttpServer())
      .delete('/feriados/4305439/05-01/')
      .expect(403);
  });

  it('should be able to put a state holiday', async () => {
    await request(app.getHttpServer())
      .put('/feriados/33/11-20/')
      .send({ name: 'Consciência Negra' })
      .set('Content-Type', 'application/json')
      .expect(201);
  });

  it('should return 200 and Consciência Negra', () => {
    return request(app.getHttpServer())
      .get('/feriados/33/2020-11-20')
      .expect(200)
      .expect({
        name: 'Consciência Negra',
      });
  });

  it('should return 200 and Consciência Negra in capital', () => {
    return request(app.getHttpServer())
      .get('/feriados/3304557/2020-11-20')
      .expect(200)
      .expect({
        name: 'Consciência Negra',
      });
  });

  it('should not be able to delete a state holiday in a city (returns 403)', async () => {
    await request(app.getHttpServer())
      .delete('/feriados/3304557/11-20')
      .expect(403);
  });

  it('should not be able to delete a state holiday', async () => {
    await request(app.getHttpServer()).delete('/feriados/33/11-20').expect(204);
  });

  it('should return 200 and Sexta-Feira Santa', () => {
    return request(app.getHttpServer())
      .get('/feriados/2111300/2020-04-10')
      .expect(200)
      .expect({
        name: 'Sexta-Feira Santa',
      });
  });

  it('should be able to put Corpus Christi in Ouro Preto', async () => {
    await request(app.getHttpServer())
      .put('/feriados/3146107/corpus-christi')
      .set('Content-Type', 'application/json')
      .expect(201);
  });

  it('should return 200 and Corpus Christi', () => {
    return request(app.getHttpServer())
      .get('/feriados/3146107/2020-06-11/')
      .expect(200)
      .expect({
        name: 'Corpus Christi',
      });
  });

  it('should return 200 and Corpus Christi', () => {
    return request(app.getHttpServer())
      .get('/feriados/3146107/2021-06-03/')
      .expect(200)
      .expect({
        name: 'Corpus Christi',
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
