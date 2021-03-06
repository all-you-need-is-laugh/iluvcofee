import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import 'jest-extended';
import supertest from 'supertest';

import { AppModule } from '../../src/app/app.module';
import setupApp from '../../src/app/setupApp';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto';
import { UpdateCoffeeDto } from '../../src/coffees/dto/update-coffee.dto';
import { CoffeePublic } from '../../src/coffees/entities/coffee-public.entity';
import { assertArray, assertNumber, assertObject } from '../utils/assertions';
import { maxNumber } from '../utils/maxNumber';
import {
  parseResponseData,
  parseResponseDataAsArray,
  parseResponseDataWithShape,
  parseResponseDataWithTemplate,
  parseResponseError
} from '../utils/parseResponse';
import { statusChecker } from '../utils/statusChecker';
import { asObject } from '../utils/type-convertions';
import { Shape } from '../utils/types/Shape';
import { SuperTestRequestAuthParameters, SuperTestResponse, SuperTestServer } from '../utils/types/SuperTest';

const createCoffeeDto: CreateCoffeeDto = {
  name: 'New Coffee Name',
  brand: 'New Coffee Brand',
  flavors: [ 'new', 'coffee' ]
};
const updateCoffeeDtoTemplate: UpdateCoffeeDto = {
  name: 'Updated Coffee Name',
  brand: 'Updated Coffee Brand',
  flavors: [ 'updated', 'coffee' ]
};

describe('CoffeesController (e2e)', () => {
  let app: INestApplication;
  let server: SuperTestServer;
  const TEST_SERVER_API_KEY = 'test_01234567890';
  const authParams: SuperTestRequestAuthParameters = [ TEST_SERVER_API_KEY, { type: 'bearer' } ];

  async function requestToCreateAuthorized (createDto: CreateCoffeeDto): Promise<CoffeePublic> {
    const response: SuperTestResponse = await server.post('/coffees')
      .auth(...authParams)
      .send(createDto)
      .expect(statusChecker(201));

    const newCoffeeResult = parseResponseDataWithTemplate(response, createDto);

    assertNumber(newCoffeeResult, 'id', 0);
    assertNumber(newCoffeeResult, 'recommendations', 0);

    return newCoffeeResult;
  }

  async function requestToUpdateAuthorized (
    entityToUpdate: CoffeePublic, updateDto: Partial<UpdateCoffeeDto>
  ): Promise<Shape<CoffeePublic>> {
    const responseToUpdate: SuperTestResponse = await server.patch(`/coffees/${entityToUpdate.id}`)
      .auth(...authParams)
      .send(updateDto)
      .expect(statusChecker(200));

    return parseResponseDataWithShape(responseToUpdate, entityToUpdate);
  }

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
        await requestToCreateAuthorized(createCoffeeDto);
      });
    });

    describe('failure', () => {
      const createWithWrongBodyCheck = async (wrongBody: Record<string, unknown>, message: string) => {
        const response: SuperTestResponse = await server.post('/coffees')
          .auth(...authParams)
          .send(wrongBody)
          .expect(statusChecker(400));

        const error = parseResponseError(response);

        expect(error).toEqual(message);
      };

      it('should respond with status 403 for unauthorized request', async () => {
        const response: SuperTestResponse = await server.post('/coffees')
          .send(createCoffeeDto)
          .expect(statusChecker(403));

        const error = parseResponseError(response);

        expect(error).toBe('Forbidden resource');
      });

      it(`should respond with status 400 for body with unknown field`, async () => {
        await createWithWrongBodyCheck(
          { ...createCoffeeDto, unknownField: 'unknown value' },
          `body field "unknownField" should not exist (passed value: "unknown value")`
        );
      });

      it('should respond with status 400 for absent body', async () => {
        const response: SuperTestResponse = await server.post('/coffees')
          .auth(...authParams)
          .expect(statusChecker(400));

        const error = parseResponseError(response);

        expect(error).toEqual('body field "brand" must be a string (passed value: undefined)');
      });

      describe('should respond with status 400 for body with absent mandatory field', () => {
        // This object protects us from forgetting to test a new field in CreateCoffeeDto
        const errorMessages: Record<keyof CreateCoffeeDto, string> = {
          brand: `body field "brand" must be a string (passed value: undefined)`,
          flavors: `each value in body field "flavors" must be a string (passed value: undefined)`,
          name: `body field "name" must be a string (passed value: undefined)`
        };

        for (const key of Object.keys(createCoffeeDto)) {
          const dtoKey = key as keyof UpdateCoffeeDto;

          it(dtoKey, async () => {
            await createWithWrongBodyCheck({ ...createCoffeeDto, [dtoKey]: undefined }, errorMessages[dtoKey]);
          });
        }
      });

    });
  });

  describe('[GET] /coffees/:id', () => {

    describe('success', () => {

      it('should return one coffee by ID', async () => {
        const newCoffeeResult = await requestToCreateAuthorized(createCoffeeDto);

        const responseToGet: SuperTestResponse = await server.get(`/coffees/${newCoffeeResult.id}`)
          .expect(statusChecker(200));

        parseResponseDataWithTemplate(responseToGet, newCoffeeResult);
      });
    });

    describe('failure', () => {
      const getByWrongIdCheck = async (wrongId: number | string, status: number, message: string) => {
        const response: SuperTestResponse = await server.get(`/coffees/${wrongId}`)
          .expect(statusChecker(status));

        const error = parseResponseError(response);

        expect(error).toEqual(message);
      };

      it('should respond with error for wrong ID (in range of signed 4-byte integer - not found)', async () => {
        const wrongId = maxNumber(4, true);

        await getByWrongIdCheck(wrongId, 404, `Coffee #${wrongId} not found`);
      });

      it('should respond with error for wrong ID (unsupported by database - not found)', async () => {
        const wrongId = Number.MAX_SAFE_INTEGER;

        await getByWrongIdCheck(wrongId, 404, `Coffee #${wrongId} not found`);
      });

      it('should respond with error for wrong ID (not a number fully - validation error)', async () => {
        await getByWrongIdCheck('1hi', 400, `parameter "id" must be an integer number (passed value: "1hi")`);
      });

      it('should respond with error for wrong ID (negative value - validation error)', async () => {
        await getByWrongIdCheck(-1, 400, `parameter "id" must not be less than 0 (passed value: "-1")`);
      });

      it('should respond with error for wrong ID (float value - validation error)', async () => {
        await getByWrongIdCheck(123.456, 400, `parameter "id" must be an integer number (passed value: "123.456")`);
      });

      it('should respond with error for wrong ID (NaN - validation error)', async () => {
        await getByWrongIdCheck(NaN, 400, `parameter "id" must be an integer number (passed value: "NaN")`);
      });

      it('should respond with error for wrong ID (Infinity - validation error)', async () => {
        await getByWrongIdCheck(Infinity, 400, `parameter "id" must be an integer number (passed value: "Infinity")`);
      });
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
        const [ firstCreated, secondCreated ] = await Promise.all([
          requestToCreateAuthorized(firstCoffeeDto),
          requestToCreateAuthorized(secondCoffeeDto),
        ]);

        const responseToGet: SuperTestResponse = await server.get('/coffees')
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

            return requestToCreateAuthorized(coffeeDto);
          })
        );

        // Database can (and most likely) has another items, so don't expect to obtain only those items we just created!

        const responseToGetAllCoffees: SuperTestResponse = await server.get('/coffees')
          .expect(statusChecker(200));

        const allCoffees = parseResponseDataAsArray(responseToGetAllCoffees);

        expect(allCoffees.length).toBeGreaterThanOrEqual(10);

        const responseToGetFirstPage: SuperTestResponse = await server.get(`/coffees?limit=${PAGE_SIZE}`)
          .expect(statusChecker(200));

        const firstPage = parseResponseDataAsArray(responseToGetFirstPage);

        expect(firstPage.length).toBe(5);

        const responseToGetSecondPage: SuperTestResponse = await server.get(`/coffees?limit=${PAGE_SIZE}`)
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
          const newCoffeeResult = await requestToCreateAuthorized(createCoffeeDto);

          const updatedCoffeeResult = await requestToUpdateAuthorized(newCoffeeResult, updateCoffeeDto);

          assertArray(updatedCoffeeResult.flavors);
          updatedCoffeeResult.flavors.sort();

          const expected = { ...newCoffeeResult, ...updateCoffeeDto };

          // Copy flavors array from `expected` before sort to avoid changing
          // of `updateCoffeeDto` (as `updateCoffeeBasicDto`)
          expected.flavors = expected.flavors.slice().sort();

          assertObject(updatedCoffeeResult, expected);
        });

      for (const key of Object.keys(updateCoffeeDtoTemplate)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeDtoTemplate[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeDtoTemplate);
    });

    describe('and changed value', () => {
      const dynamicIt = (updateField: string, updateCoffeeDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const newCoffeeResult = await requestToCreateAuthorized(createCoffeeDto);

          await requestToUpdateAuthorized(newCoffeeResult, updateCoffeeDto);

          const responseToGet: SuperTestResponse = await server.get(`/coffees/${newCoffeeResult.id}`)
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

      for (const key of Object.keys(updateCoffeeDtoTemplate)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeDtoTemplate[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeDtoTemplate);
    });

    describe('failure', () => {
      it('should respond with status 403 for unauthorized request', async () => {
        const response: SuperTestResponse = await server.patch('/coffees/123')
          .send({})
          .expect(statusChecker(403));

        const error = parseResponseError(response);

        expect(error).toBe('Forbidden resource');
      });

      describe('should respond with error for wrong ID', () => {
        const updateByWrongIdCheck = async (wrongId: number | string, status: number, message: string) => {
          const response: SuperTestResponse = await server.patch(`/coffees/${wrongId}`)
            .auth(...authParams)
            .expect(statusChecker(status));

          const error = parseResponseError(response);

          expect(error).toEqual(message);
        };

        it('in range of signed 4-byte integer - not found', async () => {
          const wrongId = maxNumber(4, true);

          await updateByWrongIdCheck(wrongId, 404, `Coffee #${wrongId} not found`);
        });

        it('unsupported by database - not found', async () => {
          const wrongId = Number.MAX_SAFE_INTEGER;

          await updateByWrongIdCheck(wrongId, 404, `Coffee #${wrongId} not found`);
        });

        it('not a number fully - validation error', async () => {
          await updateByWrongIdCheck('1hi', 400, `parameter "id" must be an integer number (passed value: "1hi")`);
        });

        it('negative value - validation error', async () => {
          await updateByWrongIdCheck(-1, 400, `parameter "id" must not be less than 0 (passed value: "-1")`);
        });

        it('float value - validation error', async () => {
          await updateByWrongIdCheck(
            123.456,
            400,
            `parameter "id" must be an integer number (passed value: "123.456")`
          );
        });

        it('NaN - validation error', async () => {
          await updateByWrongIdCheck(NaN, 400, `parameter "id" must be an integer number (passed value: "NaN")`);
        });

        it('Infinity - validation error', async () => {
          await updateByWrongIdCheck(
            Infinity,
            400,
            `parameter "id" must be an integer number (passed value: "Infinity")`
          );
        });
      });
    });
  });

  describe('[DELETE] /coffees/:id', () => {

    describe('success', () => {
      const deleteByValidIdCheck = async (id: number, result: boolean) => {
        const response: SuperTestResponse = await server.delete(`/coffees/${id}`)
          .auth(...authParams)
          .expect(statusChecker(200));

        const removeCoffeeResult = parseResponseData(response);

          expect(removeCoffeeResult).toBe(result);
      };

      it('should return `true` after deletion', async () => {
        const newCoffeeResult = await requestToCreateAuthorized(createCoffeeDto);

        await deleteByValidIdCheck(newCoffeeResult.id, true);
      });

      it('should return `false` for any valid ID (in range of signed 4-byte integer)', async () => {
        const validId = maxNumber(4, true);

        await deleteByValidIdCheck(validId, false);
      });

      it('should return `false` for any valid ID (unsupported by database)', async () => {
        const validId = Number.MAX_SAFE_INTEGER;

        await deleteByValidIdCheck(validId, false);
      });
    });

    describe('failure', () => {
      it('should respond with status 403 for unauthorized request', async () => {
        const response: SuperTestResponse = await server.delete('/coffees/123')
          .expect(statusChecker(403));

        const error = parseResponseError(response);

        expect(error).toBe('Forbidden resource');
      });

      describe('should respond with error for wrong ID', () => {
        const deleteByWrongIdCheck = async (wrongId: number | string, status: number, message: string) => {
          const response: SuperTestResponse = await server.delete(`/coffees/${wrongId}`)
            .auth(...authParams)
            .expect(statusChecker(status));

          const error = parseResponseError(response);

          expect(error).toEqual(message);
        };

        it('not a number fully - validation error', async () => {
          await deleteByWrongIdCheck('1hi', 400, `parameter "id" must be an integer number (passed value: "1hi")`);
        });

        it('negative value - validation error', async () => {
          await deleteByWrongIdCheck(-1, 400, `parameter "id" must not be less than 0 (passed value: "-1")`);
        });

        it('float value - validation error', async () => {
          await deleteByWrongIdCheck(
            123.456,
            400,
            `parameter "id" must be an integer number (passed value: "123.456")`
          );
        });

        it('NaN - validation error', async () => {
          await deleteByWrongIdCheck(NaN, 400, `parameter "id" must be an integer number (passed value: "NaN")`);
        });

        it('Infinity - validation error', async () => {
          await deleteByWrongIdCheck(
            Infinity,
            400,
            `parameter "id" must be an integer number (passed value: "Infinity")`
          );
        });
      });
    });
  });
});

