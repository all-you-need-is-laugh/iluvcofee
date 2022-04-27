/* eslint-disable max-len */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'jest-extended';
import supertest from 'supertest';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto';
import { UpdateCoffeeDto } from '../../src/coffees/dto/update-coffee.dto';
import setupApp from '../../src/setupApp';
import { assertObject } from '../utils/assertions';
import { SafeResponse } from '../utils/SafeResponse';
import { statusChecker } from '../utils/statusChecker';

const createCoffeeDto: CreateCoffeeDto = {
  name: 'New Coffee Name',
  brand: 'New Coffee Brand',
  flavors: [ 'new', 'coffee' ]
};
const updateCoffeeBasicDto: UpdateCoffeeDto = {
  name: 'Updated Coffee Name',
  brand: 'Updated Coffee Brand',
  flavors: [ 'updated', 'coffee' ]
};

describe('CoffeesController (e2e)', () => {
  let app: INestApplication;
  let server: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          autoLoadEntities: true,
          database: 'iluvcofee',
          host: 'localhost',
          password: 'postgres',
          port: 5442,
          synchronize: process.env.NODE_ENV !== 'production',
          type: 'postgres',
          username: 'postgres',
        })
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    setupApp(app);
    await app.init();

    server = supertest(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[POST] /coffees', () => {

    describe('success', () => {
      it('should create coffee and return its full entity as result', async () => {
        const { body: newCoffeeResult }: SafeResponse = await server.post('/coffees')
          .send(createCoffeeDto)
          .expect(statusChecker(201));

        assertObject(newCoffeeResult, createCoffeeDto);

        expect(newCoffeeResult.id).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('[GET] /coffees/:id', () => {

    describe('success', () => {

      it('should return one coffee by ID', async () => {
        const { body: newCoffeeResult }: SafeResponse = await server.post('/coffees')
          .send(createCoffeeDto)
          .expect(statusChecker(201));

        assertObject(newCoffeeResult, createCoffeeDto);

        const { body: foundCoffee }: SafeResponse = await server.get(`/coffees/${newCoffeeResult.id}`)
          .expect(statusChecker(200));

        expect(foundCoffee).toEqual(newCoffeeResult);
      });
    });

    describe('failure', () => {
      it.todo('should throw error for absent ID');
    });
  });

  describe('[GET] /coffees', () => {

    describe('success', () => {

      it('should return all coffees by ID', async () => {
        const firstCoffeeDto: CreateCoffeeDto = {
          name: 'First Coffee Name',
          brand: 'First Coffee Brand',
          flavors: [ 'first', 'coffee' ]
        };
        const secondCoffeeDto: CreateCoffeeDto = {
          name: 'Second Coffee Name',
          brand: 'Second Coffee Brand',
          flavors: [ 'second', 'coffee' ]
        };
        const [ { body: firstCreated }, { body: secondCreated } ]: [SafeResponse, SafeResponse] = await Promise.all([
          server.post('/coffees')
            .send(firstCoffeeDto)
            .expect(statusChecker(201)),
          server.post('/coffees')
            .send(secondCoffeeDto)
            .expect(statusChecker(201)),
        ]);

        assertObject(firstCreated, firstCoffeeDto);
        assertObject(secondCreated, secondCoffeeDto);

        const { body: foundCoffees }: SafeResponse = await server.get('/coffees')
          .expect(statusChecker(200));

        if (!Array.isArray(foundCoffees)) {
          throw new Error(
            `Result of [GET] '/coffees' request must be array, but received: ${JSON.stringify(foundCoffees)}`
          );
        }

        const foundFirstCoffee = foundCoffees.find(c => c.id === firstCreated.id);
        const foundSecondCoffee = foundCoffees.find(c => c.id === secondCreated.id);

        expect(foundFirstCoffee).toEqual(firstCreated);
        expect(foundSecondCoffee).toEqual(secondCreated);
      });
    });
  });

  describe('[PATCH] /coffees/:id', () => {

    describe('and result', () => {
      const dynamicIt = (updateField: string, updateCoffeeDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const { body: newCoffeeResult }: SafeResponse = await server.post('/coffees')
            .send(createCoffeeDto)
            .expect(statusChecker(201));

          assertObject(newCoffeeResult, createCoffeeDto);

          const { body: updatedCoffeeResult }: SafeResponse = await server.patch(`/coffees/${newCoffeeResult.id}`)
            .send(updateCoffeeDto)
            .expect(statusChecker(200));

          assertObject(updatedCoffeeResult, { ...newCoffeeResult, ...updateCoffeeDto });
        });

      for (const key of Object.keys(updateCoffeeBasicDto)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeBasicDto[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeBasicDto);
    });

    describe('and changed value', () => {
      const dynamicIt = (updateField: string, updateCoffeeDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const { body: newCoffeeResult }: SafeResponse = await server.post('/coffees')
            .send(createCoffeeDto)
            .expect(statusChecker(201));

          assertObject(newCoffeeResult, createCoffeeDto);

          await server.patch(`/coffees/${newCoffeeResult.id}`)
            .send(updateCoffeeDto)
            .expect(statusChecker(200));

          const { body: foundCoffeeResult }: SafeResponse = await server.get(`/coffees/${newCoffeeResult.id}`)
            .expect(statusChecker(200));

          assertObject(foundCoffeeResult, { ...newCoffeeResult, ...updateCoffeeDto });
        });

      for (const key of Object.keys(updateCoffeeBasicDto)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeBasicDto[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeBasicDto);
    });

    describe('failure', () => {
      it.todo('should throw error for absent ID');
    });
  });

  describe('[DELETE] /coffees/:id', () => {

    describe('success', () => {
      it('should return `true` after deletion', async () => {
        const { body: newCoffeeResult }: SafeResponse = await server.post('/coffees')
          .send(createCoffeeDto)
          .expect(statusChecker(201));

        assertObject(newCoffeeResult, createCoffeeDto);

        const { body: removeCoffeeResult }: SafeResponse = await server.delete(`/coffees/${newCoffeeResult.id}`)
          .expect(statusChecker(200));

        expect(removeCoffeeResult).toBe(true);
      });

      it.todo('should return `false` for absent ID');
    });
  });
});
