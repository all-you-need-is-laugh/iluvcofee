import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { assertObject } from '../../test/utils/assertions';
import { checkRejection } from '../../test/utils/checkRejection';
import { maxNumber } from '../../test/utils/maxNumber';
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
        SharedTypeOrmModule.forRoot(),
        SharedTypeOrmModule.forFeature([ Coffee, Flavor ])
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

      expect(newCoffee).toMatchObject({ ...createCoffeeDto, flavors: [ ...createCoffeeDto.flavors ] });
      expect(newCoffee.id).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findOne', () => {
    it('should return one coffee by ID', async () => {
      const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);

      const foundCoffee: CoffeePublic = await coffeesService.findOne(newCoffee.id);

      expect(foundCoffee).toMatchObject({ ...newCoffee, flavors: [ ...newCoffee.flavors ] });
    });

    it('should throw error for absent ID (in range of signed 4-byte integer)', async () => {
      const absentId = maxNumber(4, true);

      await checkRejection(() => coffeesService.findOne(absentId), `Coffee #${absentId} not found`, NotFoundException);
    });

    it('should throw error for absent ID (out of range)', async () => {
      const absentId = Number.MAX_SAFE_INTEGER;

      await checkRejection(() => coffeesService.findOne(absentId), `Coffee #${absentId} not found`, NotFoundException);
    });
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

      expect(foundFirstCoffee).toMatchObject({ ...firstCreated, flavors: [ ...firstCreated.flavors ] });

      expect(foundSecondCoffee).toMatchObject({ ...secondCreated, flavors: [ ...secondCreated.flavors ] });
    });

    it.todo('should return not more items than specified in `limit` pagination parameter');

    // Implement it after any parent entity for Coffee will be added
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
      it('should throw error for absent ID (in range of signed 4-byte integer)', async () => {
        const absentId = maxNumber(4, true);

        await checkRejection(
          () => coffeesService.update(absentId, updateCoffeeDto),
            `Coffee #${absentId} not found`,
            NotFoundException
        );
      });

      it('should throw error for absent ID (out of range)', async () => {
        const absentId = Number.MAX_SAFE_INTEGER;

        await checkRejection(
          () => coffeesService.update(absentId, updateCoffeeDto),
            `Coffee #${absentId} not found`,
            NotFoundException
        );
      });
    });
  });

  describe('remove', () => {
    it('should return `true` after deletion', async () => {
      const newCoffee: CoffeePublic = await coffeesService.create(createCoffeeDto);

      expect(await coffeesService.remove(newCoffee.id)).toBe(true);
    });

    it('should throw error for absent ID (in range of signed 4-byte integer)', async () => {
      const absentId = maxNumber(4, true);

      expect(await coffeesService.remove(absentId)).toBe(false);
    });

    it('should throw error for absent ID (out of range)', async () => {
      const absentId = Number.MAX_SAFE_INTEGER;

      expect(await coffeesService.remove(absentId)).toBe(false);
    });
  });
});
