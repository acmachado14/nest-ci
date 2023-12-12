import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HolidayModule } from '../src/holiday.module';

describe('HolidayController GET (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HolidayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET - Invalid Requests', () => {
    it('should return 404 when a request is send with non existent state', () => {
      return request(app.getHttpServer())
        .get('/feriados/00/2020-05-01')
        .expect(404)
        .expect({
          message: 'Estado não encontrado',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return 404 when a request is send with non existent city', () => {
      return request(app.getHttpServer())
        .get('/feriados/0000000/2020-05-01')
        .expect(404)
        .expect({
          message: 'Cidade não encontrada',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return 400 when a request is send with invalid city or state', () => {
      return request(app.getHttpServer())
        .get('/feriados/123/2020-05-01')
        .expect(400)
        .expect({
          message: 'Código IBGE deve ter 2 ou 7 caracteres',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 400 when a request is send with invalid date', () => {
      return request(app.getHttpServer())
        .get('/feriados/31/23-04-2003')
        .expect(400)
        .expect({
          message: 'Formato de data inválido. Use AAAA-MM-DD',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });

  describe('PUT - Invalid Requests', () => {
    it('should return 400 when a request is send with non existent mobile-holiday', () => {
      return request(app.getHttpServer())
        .put('/feriados/33/justestin/')
        .send({ name: 'Dia do Trabalhador' })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect({
          message: 'Feriado não encontrado!',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 404 when a request is send with non existent state', () => {
      return request(app.getHttpServer())
        .put('/feriados/00/05-01/')
        .send({ name: 'Dia do Trabalhador' })
        .set('Content-Type', 'application/json')
        .expect(404)
        .expect({
          message: 'Estado não encontrado',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return 404 when a request is send with non existent city', () => {
      return request(app.getHttpServer())
        .put('/feriados/0000000/05-01/')
        .send({ name: 'Dia do Trabalhador' })
        .set('Content-Type', 'application/json')
        .expect(404)
        .expect({
          message: 'Cidade não encontrada',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return 400 when a request is send with invalid city or state', () => {
      return request(app.getHttpServer())
        .put('/feriados/123/05-01/')
        .send({ name: 'Dia do Trabalhador' })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect({
          message: 'Código IBGE deve ter 2 ou 7 caracteres',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 400 when a request is send with invalid date', () => {
      return request(app.getHttpServer())
        .put('/feriados/31/23-04-2003')
        .send({ name: 'Dia do Trabalhador' })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect({
          message: 'Formato de data inválido. Use "MM-DD".',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });

  describe('DELETE - Invalid Requests', () => {
    it('should return 400 when a request is send with non existent mobile-holiday', () => {
      return request(app.getHttpServer())
        .delete('/feriados/33/justestin/')
        .expect(400)
        .expect({
          message: 'Feriado não encontrado!',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 404 when a request is send with non existent state', () => {
      return request(app.getHttpServer())
        .delete('/feriados/00/05-01/')
        .expect(404)
        .expect({
          message: 'Estado não encontrado',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return 404 when a request is send with non existent city', () => {
      return request(app.getHttpServer())
        .delete('/feriados/0000000/05-01/')
        .expect(404)
        .expect({
          message: 'Cidade não encontrada',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return 400 when a request is send with invalid city or state', () => {
      return request(app.getHttpServer())
        .delete('/feriados/123/05-01/')
        .expect(400)
        .expect({
          message: 'Código IBGE deve ter 2 ou 7 caracteres',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should return 400 when a request is send with invalid date', () => {
      return request(app.getHttpServer())
        .delete('/feriados/31/23-04-2003')
        .expect(400)
        .expect({
          message: 'Formato de data inválido. Use "MM-DD".',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });
});
