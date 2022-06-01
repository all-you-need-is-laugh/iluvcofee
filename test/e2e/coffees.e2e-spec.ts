import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import 'jest-extended';
import supertest from 'supertest';
import { AppModule } from '../../src/app/app.module';
import setupApp from '../../src/app/setupApp';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto';
import { UpdateCoffeeDto } from '../../src/coffees/dto/update-coffee.dto';
import { assertArray, assertObject } from '../utils/assertions';
import { maxNumber } from '../utils/maxNumber';
import {
  parseResponseData,
  parseResponseDataAsArray,
  parseResponseDataWithShape,
  parseResponseDataWithTemplate
} from '../utils/parseResponseData';
import { statusChecker } from '../utils/statusChecker';
import { asObject } from '../utils/type-convertions';
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
      imports: [ AppModule ],
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
        const response: SafeResponse = await server.post('/coffees')
          .send(createCoffeeDto)
          .expect(statusChecker(201));

        const newCoffeeResult = parseResponseDataWithTemplate(response, createCoffeeDto);

        expect(newCoffeeResult.id).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('[GET] /coffees/:id', () => {

    describe('success', () => {

      it('should return one coffee by ID', async () => {
        const responseToCreate: SafeResponse = await server.post('/coffees')
          .send(createCoffeeDto)
          .expect(statusChecker(201));

        const newCoffeeResult = parseResponseDataWithTemplate(responseToCreate, createCoffeeDto);

        expect(newCoffeeResult.id).toBeGreaterThanOrEqual(1);

        const responseToGet: SafeResponse = await server.get(`/coffees/${newCoffeeResult.id}`)
          .expect(statusChecker(200));

        parseResponseDataWithTemplate(responseToGet, newCoffeeResult);
      });
    });

    describe('failure', () => {
      it('should response with error for wrong ID (in range of signed 4-byte integer)', async () => {
        const wrongId = maxNumber(4, true);

        const { body: foundCoffee }: SafeResponse = await server.get(`/coffees/${wrongId}`)
          .expect(statusChecker(404));

        assertObject(foundCoffee);

        expect(foundCoffee.error).toEqual(`Coffee #${wrongId} not found`);
      });

      it('should response with error for wrong ID (unsupported by database)', async () => {
        const wrongId = Number.MAX_SAFE_INTEGER;

        const { body: foundCoffee }: SafeResponse = await server.get(`/coffees/${wrongId}`)
          .expect(statusChecker(404));

        assertObject(foundCoffee);

        expect(foundCoffee.error).toEqual(`Coffee #${wrongId} not found`);
      });

      // TODO: [validation] [tests] add test case
      it.todo('should response with error for wrong ID (negative value - validation error)');
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
        const [ responseToFirstCreate, responseToSecondCreate ]: [SafeResponse, SafeResponse] = await Promise.all([
          server.post('/coffees')
            .send(firstCoffeeDto)
            .expect(statusChecker(201)),
          server.post('/coffees')
            .send(secondCoffeeDto)
            .expect(statusChecker(201)),
        ]);

        const firstCreated = parseResponseDataWithTemplate(responseToFirstCreate, firstCoffeeDto);
        const secondCreated = parseResponseDataWithTemplate(responseToSecondCreate, secondCoffeeDto);

        const responseToGet: SafeResponse = await server.get('/coffees')
          .expect(statusChecker(200));

        const foundCoffees = parseResponseDataAsArray(responseToGet);

        const foundFirstCoffee = foundCoffees.find(c => asObject(c).id === firstCreated.id);
        const foundSecondCoffee = foundCoffees.find(c => asObject(c).id === secondCreated.id);

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

        const responseToGetAllCoffees: SafeResponse = await server.get('/coffees')
          .expect(statusChecker(200));

        const allCoffees = parseResponseDataAsArray(responseToGetAllCoffees);

        expect(allCoffees.length).toBeGreaterThanOrEqual(10);

        const responseToGetFirstPage: SafeResponse = await server.get(`/coffees?limit=${PAGE_SIZE}`)
          .expect(statusChecker(200));

        const firstPage = parseResponseDataAsArray(responseToGetFirstPage);

        expect(firstPage.length).toBe(5);

        const responseToGetSecondPage: SafeResponse = await server.get(`/coffees?limit=${PAGE_SIZE}`)
          .expect(statusChecker(200));

        const secondPage = parseResponseDataAsArray(responseToGetSecondPage);

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
          const responseToCreate: SafeResponse = await server.post('/coffees')
            .send(createCoffeeDto)
            .expect(statusChecker(201));

          const newCoffeeResult = parseResponseDataWithTemplate(responseToCreate, createCoffeeDto);
          expect(newCoffeeResult.id).toBeGreaterThanOrEqual(1);

          const responseToUpdate: SafeResponse = await server.patch(`/coffees/${newCoffeeResult.id}`)
            .send(updateCoffeeDto)
            .expect(statusChecker(200));

          const updatedCoffeeResult = parseResponseDataWithShape(responseToUpdate, newCoffeeResult);

          assertArray(updatedCoffeeResult.flavors);
          updatedCoffeeResult.flavors.sort();

          const expected = { ...newCoffeeResult, ...updateCoffeeDto };

          // Copy flavors array from `expected` before sort to avoid changing
          // of `updateCoffeeDto` (as `updateCoffeeBasicDto`)
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
          const responseToCreate: SafeResponse = await server.post('/coffees')
            .send(createCoffeeDto)
            .expect(statusChecker(201));

          const newCoffeeResult = parseResponseDataWithTemplate(responseToCreate, createCoffeeDto);
          expect(newCoffeeResult.id).toBeGreaterThanOrEqual(1);

          await server.patch(`/coffees/${newCoffeeResult.id}`)
            .send(updateCoffeeDto)
            .expect(statusChecker(200));

          const responseToGet: SafeResponse = await server.get(`/coffees/${newCoffeeResult.id}`)
            .expect(statusChecker(200));

          const foundCoffeeResult = parseResponseDataWithShape(responseToGet, newCoffeeResult);

          assertArray(foundCoffeeResult.flavors);
          foundCoffeeResult.flavors.sort();

          const expected = { ...newCoffeeResult, ...updateCoffeeDto };

          // Copy flavors array from `expected` before sort to avoid changing
          // of `updateCoffeeDto` (as `updateCoffeeBasicDto`)
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
      // TODO: [validation] [tests] add test case
      it.todo('should response with error for wrong ID (in range of signed 4-byte integer)');

      // TODO: [validation] [tests] add test case
      it.todo('should response with error for wrong ID (unsupported by database)');

      // TODO: [validation] [tests] add test case
      it.todo('should response with error for wrong ID (negative value - validation error)');
    });
  });

  describe('[DELETE] /coffees/:id', () => {

    describe('success', () => {
      it('should return `true` after deletion', async () => {
        const responseToCreate: SafeResponse = await server.post('/coffees')
          .send(createCoffeeDto)
          .expect(statusChecker(201));

        const newCoffeeResult = parseResponseDataWithTemplate(responseToCreate, createCoffeeDto);

        expect(newCoffeeResult.id).toBeGreaterThanOrEqual(1);

        const responseToDelete: SafeResponse = await server.delete(`/coffees/${newCoffeeResult.id}`)
          .expect(statusChecker(200));

        const removeCoffeeResult = parseResponseData(responseToDelete);

        expect(removeCoffeeResult).toBe(true);
      });
    });

    describe('failure', () => {
      // TODO: [validation] [tests] add test case
      it.todo('should response with error for wrong ID (in range of signed 4-byte integer)');

      // TODO: [validation] [tests] add test case
      it.todo('should response with error for wrong ID (unsupported by database)');

      // TODO: [validation] [tests] add test case
      it.todo('should response with error for wrong ID (negative value - validation error)');
    });
  });
});
