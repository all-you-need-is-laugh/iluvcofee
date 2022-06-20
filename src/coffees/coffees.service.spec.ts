import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { assertObject } from '../../test/utils/assertions';
import { checkRejection } from '../../test/utils/checkRejection';
import { maxNumber } from '../../test/utils/maxNumber';
import { SharedConfigModule } from '../config/shared-config.module';
import { Event, EventSchema } from '../events/entities/event.entity';
import { SharedMongooseModule } from '../mongoose/shared-mongoose.module';
import { SharedTypeOrmModule } from '../typeorm/shared-typeorm.module';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CoffeePublic } from './entities/coffee-public.entity';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

const createCoffeeDto: CreateCoffeeDto = {
  name: 'New Coffee Name',
  brand: 'New Coffee Brand',
  flavors: [ 'new', 'coffee' ]
};

const updateCoffeeDto: UpdateCoffeeDto = {
  name: 'Updated Coffee Name',
  brand: 'Updated Coffee Brand',
  flavors: [ 'updated', 'coffee' ]
};

describe('CoffeesService', () => {
  let coffeesService: CoffeesService;
  let dataSource: DataSource | undefined;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        SharedConfigModule.forRoot(),
        SharedTypeOrmModule.forRoot(),
        SharedTypeOrmModule.forFeature([ Coffee, Flavor ]),
        SharedMongooseModule.forRoot(),
        SharedMongooseModule.forFeature([
          {
            name: Event.name,
            schema: EventSchema
          }
        ]),
      ],
      providers: [ CoffeesService ],
    }).compile();

    coffeesService = moduleRef.get<CoffeesService>(CoffeesService);

    dataSource = moduleRef.get<DataSource>(getConnectionToken());
  });

  afterAll(async () => {
    if (!dataSource) return;

    await dataSource.destroy();
  });

  describe('create', () => {
    it('should create coffee and return its full entity as result', async () => {
      const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);

      // Flavors are assigned with spread value to emphasize that value should be with the same elements and not the
      // same array
      expect(newCoffee).toMatchObject({ ...createCoffeeDto, flavors: [ ...createCoffeeDto.flavors ] });
      expect(newCoffee.id).toBeGreaterThanOrEqual(0);
    });

    it('should create several coffees with the same flavors simultaneously', async () => {
      const N = 10;

      const flavors = [ `test_first_${Date.now()}`, `test_second_${Date.now()}` ];
      await Promise.all(Array.from({ length: N }, async (_, index) => {
        const payload = { ...createCoffeeDto, name: `Test Coffee #${index}`, flavors };
        const newCoffee: CoffeePublic = await coffeesService.create(payload);

        // Flavors are assigned with spread value to emphasize that value should be with the same elements and not the
        // same array
        expect(newCoffee).toMatchObject({ ...payload, flavors: [ ...flavors ] });
        expect(newCoffee.id).toBeGreaterThanOrEqual(0);
      }));
    });
  });

  describe('findOne', () => {
    it('should return one coffee by ID', async () => {
      const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);

      const foundCoffee: CoffeePublic = await coffeesService.findOne(newCoffee.id);

      // Flavors are assigned with spread value to emphasize that value should be with the same elements and not the
      // same array
      expect(foundCoffee).toMatchObject({ ...newCoffee, flavors: [ ...newCoffee.flavors ] });
    });

    it('should throw error for wrong ID (in range of signed 4-byte integer)', async () => {
      const wrongId = maxNumber(4, true);

      await checkRejection(() => coffeesService.findOne(wrongId), `Coffee #${wrongId} not found`, NotFoundException);
    });

    it('should throw error for wrong ID (out of range)', async () => {
      const wrongId = Number.MAX_SAFE_INTEGER;

      await checkRejection(() => coffeesService.findOne(wrongId), `Coffee #${wrongId} not found`, NotFoundException);
    });

    // TODO: [tests] add test case
    it.todo('should throw error for wrong ID (negative value)');
  });

  describe('findAll', () => {
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
      const [ firstCreated, secondCreated ]: CoffeePublic[] = await Promise.all([
        coffeesService.create(firstCoffeeDto),
        coffeesService.create(secondCoffeeDto)
      ]);

      assertObject(firstCreated, firstCoffeeDto);
      assertObject(secondCreated, secondCoffeeDto);

      const foundCoffees: CoffeePublic[] = await coffeesService.findAll();

      const foundFirstCoffee = foundCoffees.find(c => c.id === firstCreated.id);
      const foundSecondCoffee = foundCoffees.find(c => c.id === secondCreated.id);

      // Flavors are assigned with spread value to emphasize that value should be with the same elements and not the
      // same array
      expect(foundFirstCoffee).toMatchObject({ ...firstCreated, flavors: [ ...firstCreated.flavors ] });

      // Flavors are assigned with spread value to emphasize that value should be with the same elements and not the
      // same array
      expect(foundSecondCoffee).toMatchObject({ ...secondCreated, flavors: [ ...secondCreated.flavors ] });
    });

    // TODO: [tests]
    it.todo('should return not more items than specified in `limit` pagination parameter');

    // TODO: [tests] Implement it after any parent entity for Coffee will be added
    it.todo('should return different items according to `offset` pagination parameter');
  });

  describe('update', () => {

    describe('and result', () => {
      const dynamicIt = (updateField: string, updateCoffeePartialDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);
          const updatedCoffee: CoffeePublic = await coffeesService.update(newCoffee.id, updateCoffeePartialDto);
          const expected: CoffeePublic = {
            ...newCoffee,
            ...updateCoffeePartialDto,
            flavors: [ ...(updateCoffeePartialDto.flavors || newCoffee.flavors) ].sort(),
          };

          updatedCoffee.flavors.sort();

          expect(updatedCoffee).toMatchObject(expected);
        });

      for (const key of Object.keys(updateCoffeeDto)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeDto[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeDto);
    });

    describe('and changed value', () => {
      const dynamicIt = (updateField: string, updateCoffeePartialDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);
          await coffeesService.update(newCoffee.id, updateCoffeePartialDto);
          const foundCoffee: CoffeePublic = await coffeesService.findOne(newCoffee.id);

          const expected: CoffeePublic = {
            ...newCoffee,
            ...updateCoffeePartialDto,
            flavors: [ ...(updateCoffeePartialDto.flavors || newCoffee.flavors) ].sort(),
          };

          foundCoffee.flavors.sort();

          expect(foundCoffee).toMatchObject(expected);
        });

      for (const key of Object.keys(updateCoffeeDto)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeDto[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeDto);
    });

    describe('failure', () => {
      it('should throw error for wrong ID (in range of signed 4-byte integer)', async () => {
        const wrongId = maxNumber(4, true);

        await checkRejection(
          () => coffeesService.update(wrongId, updateCoffeeDto),
            `Coffee #${wrongId} not found`,
            NotFoundException
        );
      });

      it('should throw error for wrong ID (out of range)', async () => {
        const wrongId = Number.MAX_SAFE_INTEGER;

        await checkRejection(
          () => coffeesService.update(wrongId, updateCoffeeDto),
            `Coffee #${wrongId} not found`,
            NotFoundException
        );
      });

      // TODO: [tests] add test case
      it.todo('should throw error for wrong ID (negative value)');
    });
  });

  describe('recommendCoffee', () => {
    it('should add coffee recommendation event and increase coffee recommendations number', async () => {
      const N = 3;
      const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);

      // Flavors are assigned with spread value to emphasize that value should be with the same elements and not the
      // same array
      expect(newCoffee).toMatchObject({ ...createCoffeeDto, flavors: [ ...createCoffeeDto.flavors ] });
      expect(newCoffee.id).toBeGreaterThanOrEqual(0);
      expect(newCoffee.recommendations).toBe(0);

      await Promise.all(Array.from({ length: N }, async () => {
        const recSucceeded: boolean = await coffeesService.recommendCoffee(newCoffee.id);

        expect(recSucceeded).toBe(true);
      }));

      const updatedCoffee: CoffeePublic = await coffeesService.findOne(newCoffee.id);

      expect(updatedCoffee).toMatchObject({ ...newCoffee, recommendations: N });

      const coffeeRecommendations = await coffeesService.findCoffeeRecommendations(newCoffee.id);

      expect(coffeeRecommendations.length).toBe(N);

      for (const recommendation of coffeeRecommendations) {
        expect(recommendation).toMatchObject({
          type: 'coffee',
          name: 'recommend_coffee',
          payload: { coffeeId: newCoffee.id }
        });
      }
    });
  });

  describe('remove', () => {
    it('should return `true` after deletion', async () => {
      const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);

      expect(await coffeesService.remove(newCoffee.id)).toBe(true);
    });

    it('should throw error for wrong ID (in range of signed 4-byte integer)', async () => {
      const wrongId = maxNumber(4, true);

      expect(await coffeesService.remove(wrongId)).toBe(false);
    });

    it('should throw error for wrong ID (out of range)', async () => {
      const wrongId = Number.MAX_SAFE_INTEGER;

      expect(await coffeesService.remove(wrongId)).toBe(false);
    });

    // TODO: [tests] add test case
    it.todo('should throw error for wrong ID (negative value)');
  });
});
