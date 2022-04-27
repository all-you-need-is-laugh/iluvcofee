import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { assertObject } from '../../test/utils/assertions';
import { checkError } from '../../test/utils/checkError';
import { maxNumber } from '../../test/utils/maxNumber';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

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

describe('CoffeeService', () => {
  let coffeeService: CoffeesService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          autoLoadEntities: true,
          database: 'iluvcofee',
          host: 'localhost',
          password: 'postgres',
          port: 5442,
          synchronize: process.env.NODE_ENV !== 'production',
          type: 'postgres',
          username: 'postgres',
        }),
        TypeOrmModule.forFeature([ Coffee ])
      ],
      providers: [ CoffeesService, ],
    }).compile();

    coffeeService = moduleRef.get<CoffeesService>(CoffeesService);

    dataSource = moduleRef.get<DataSource>(getConnectionToken());
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('create', () => {
    it('should create coffee and return its full entity as result', async () => {
      const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);

      expect(newCoffeeResult).toBeInstanceOf(Coffee);
      expect(newCoffeeResult).toMatchObject({ ...createCoffeeDto, flavors: [ ...createCoffeeDto.flavors ] });
      expect(newCoffeeResult.id).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findOne', () => {
    it('should return one coffee by ID', async () => {
      const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);

      const foundCoffee: Coffee = await coffeeService.findOne(newCoffeeResult.id);

      expect(foundCoffee).toBeInstanceOf(Coffee);
      expect(foundCoffee).toEqual({ ...newCoffeeResult, flavors: [ ...newCoffeeResult.flavors ] });
    });

    it('should throw error for absent ID (in range of signed 4-byte integer)', async () => {
      const absentId = maxNumber(4, true);

      await checkError(() => coffeeService.findOne(absentId), `Coffee #${absentId} not found`, NotFoundException);
    });

    it('should throw error for absent ID (out of range)', async () => {
      const absentId = Number.MAX_SAFE_INTEGER;

      await checkError(() => coffeeService.findOne(absentId), `Coffee #${absentId} not found`, NotFoundException);
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
      const [ firstCreated, secondCreated ]: Coffee[] = await Promise.all([
        coffeeService.create(firstCoffeeDto),
        coffeeService.create(secondCoffeeDto)
      ]);

      assertObject(firstCreated, firstCoffeeDto);
      assertObject(secondCreated, secondCoffeeDto);

      const foundCoffees: Coffee[] = await coffeeService.findAll();

      const foundFirstCoffee = foundCoffees.find(c => c.id === firstCreated.id);
      const foundSecondCoffee = foundCoffees.find(c => c.id === secondCreated.id);

      expect(foundFirstCoffee).toBeInstanceOf(Coffee);
      expect(foundFirstCoffee).toEqual({ ...firstCreated, flavors: [ ...firstCreated.flavors ] });

      expect(foundSecondCoffee).toBeInstanceOf(Coffee);
      expect(foundSecondCoffee).toEqual({ ...secondCreated, flavors: [ ...secondCreated.flavors ] });
    });
  });

  describe('update', () => {

    describe('and result', () => {
      const dynamicIt = (updateField: string, updateCoffeePartialDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);
          const updatedCoffeeResult: Coffee = await coffeeService.update(newCoffeeResult.id, updateCoffeePartialDto);
          const expected: Coffee = {
            ...newCoffeeResult,
            flavors: [ ...newCoffeeResult.flavors ],
            ...updateCoffeePartialDto
          };

          expect(updatedCoffeeResult).toBeInstanceOf(Coffee);
          expect(updatedCoffeeResult).toEqual(expected);
        });

      for (const key of Object.keys(updateCoffeeDto)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeDto[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeDto);
    });

    describe('and changed value', () => {
      const dynamicIt = (updateField: string, updateCoffeeDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);
          await coffeeService.update(newCoffeeResult.id, updateCoffeeDto);
          const foundCoffeeResult: Coffee = await coffeeService.findOne(newCoffeeResult.id);

          const expected: Coffee = { ...newCoffeeResult, flavors: [ ...newCoffeeResult.flavors ], ...updateCoffeeDto };

          expect(foundCoffeeResult).toBeInstanceOf(Coffee);
          expect(foundCoffeeResult).toEqual(expected);
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

        await checkError(
          () => coffeeService.update(absentId, updateCoffeeDto),
            `Coffee #${absentId} not found`,
            NotFoundException
        );
      });

      it('should throw error for absent ID (out of range)', async () => {
        const absentId = Number.MAX_SAFE_INTEGER;

        await checkError(
          () => coffeeService.update(absentId, updateCoffeeDto),
            `Coffee #${absentId} not found`,
            NotFoundException
        );
      });
    });
  });

  describe('remove', () => {
    it('should return `true` after deletion', async () => {
      const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);

      expect(await coffeeService.remove(newCoffeeResult.id)).toBe(true);
    });

    it('should throw error for absent ID (in range of signed 4-byte integer)', async () => {
      const absentId = maxNumber(4, true);

      expect(await coffeeService.remove(absentId)).toBe(false);
    });

    it('should throw error for absent ID (out of range)', async () => {
      const absentId = Number.MAX_SAFE_INTEGER;

      expect(await coffeeService.remove(absentId)).toBe(false);
    });
  });
});
