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
import { assertArray, assertObject, assertObjectShape } from '../utils/assertions';
import { statusChecker } from '../utils/statusChecker';
import { SafeResponse } from '../utils/types/SafeResponse';

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

      it('should return all coffees', async () => {
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

        assertArray(foundCoffees);

        const foundFirstCoffee = foundCoffees.find(c => (assertObject(c), c.id === firstCreated.id));
        const foundSecondCoffee = foundCoffees.find(c => (assertObject(c), c.id === secondCreated.id));

        expect(foundFirstCoffee).toEqual(firstCreated);
        expect(foundSecondCoffee).toEqual(secondCreated);
      });

      it('should return all coffees according to pagination parameters', async () => {
        const PAGE_SIZE = 5;
        const NUMBER_OF_ITEMS = PAGE_SIZE * 2;

        await Promise.all(
          Array.from({ length: NUMBER_OF_ITEMS }).map((_, index) => {
            const coffeeDto: CreateCoffeeDto = {
              name: `Coffee Name #${index}`,
              brand: `Coffee Brand #${index}`,
              flavors: [ `${index}-nth`, 'coffee' ]
            };

            return server.post('/coffees')
              .send(coffeeDto)
              .expect(statusChecker(201));
          })
        );

        // Database can (and most likely) has another items, so don't expect to obtain only those items we just created!

        const { body: allCoffees }: SafeResponse = await server.get('/coffees')
          .expect(statusChecker(200));

        assertArray(allCoffees);

        expect(allCoffees.length).toBeGreaterThanOrEqual(10);

        const { body: firstPage }: SafeResponse = await server.get(`/coffees?limit=${PAGE_SIZE}`)
          .expect(statusChecker(200));

        assertArray(firstPage);

        expect(firstPage.length).toBe(5);

        const { body: secondPage }: SafeResponse = await server.get(`/coffees?limit=${PAGE_SIZE}&offset=${PAGE_SIZE}`)
          .expect(statusChecker(200));

        assertArray(secondPage);

        expect(secondPage.length).toBe(5);

        // Here should be check that we obtained totally another set of items, but tests running in parallel can change
        // order of items (add new ones or remove some of them) so potentially we can obtain some items in both pages
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

          assertObjectShape(updatedCoffeeResult, newCoffeeResult);
          assertArray(updatedCoffeeResult.flavors);
          updatedCoffeeResult.flavors.sort();

          const expected = { ...newCoffeeResult, ...updateCoffeeDto };

          expected.flavors = expected.flavors.slice().sort();

          assertObject(updatedCoffeeResult, expected);
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

          assertObjectShape(foundCoffeeResult, newCoffeeResult);
          assertArray(foundCoffeeResult.flavors);
          foundCoffeeResult.flavors.sort();

          const expected = { ...newCoffeeResult, ...updateCoffeeDto };

          expected.flavors = expected.flavors.slice().sort();

          assertObject(foundCoffeeResult, expected);
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
