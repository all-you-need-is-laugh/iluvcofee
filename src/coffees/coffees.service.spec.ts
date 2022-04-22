import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { checkError } from '../../test/utils/checkError';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

describe('CoffeeService', () => {
  let coffeeService: CoffeesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      // imports: [ CommonModule ],
      providers: [ CoffeesService ],
    }).compile();

    coffeeService = moduleRef.get<CoffeesService>(CoffeesService);
    // redis = moduleRef.get<Redis>(getRedisToken('default'));

    // await redis.del(CoffeesService.COFFEES_SET_NAME);
  });

  afterEach(async () => {
    // await redis.del(CoffeesService.COFFEES_SET_NAME);
  });

  afterAll(async () => {
    // await redis.quit();
  });

  describe('create', () => {
    it('should create coffee and return its full entity as result', async () => {
      const coffeeDto: CreateCoffeeDto = {
        name: 'New Coffee Name',
        brand: 'New Coffee Brand',
        flavors: [ 'new', 'coffee' ]
      };
      const newCoffeeResult: Coffee = await coffeeService.create(coffeeDto);

      expect(newCoffeeResult).toBeInstanceOf(Coffee);
      expect(newCoffeeResult).toMatchObject({ ...coffeeDto, flavors: [ ...coffeeDto.flavors ] });
      expect(newCoffeeResult.id).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findOne', () => {
    it('should return one coffee by ID', async () => {
      const coffeeDto = {
        name: 'New Coffee Name',
        brand: 'New Coffee Brand',
        flavors: [ 'new', 'coffee' ]
      };
      const newCoffeeResult: Coffee = await coffeeService.create(coffeeDto);

      const foundCoffee: Coffee = await coffeeService.findOne(newCoffeeResult.id);

      expect(foundCoffee).toBeInstanceOf(Coffee);
      expect(foundCoffee).toEqual({ ...newCoffeeResult, flavors: [ ...newCoffeeResult.flavors ] });
    });

    it('should throw error for absent ID', async () => {
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

      if (firstCreated === undefined || secondCreated === undefined) {
        throw new Error(
          `Must be created 2 new defined entities, but created: ${JSON.stringify([ firstCreated, secondCreated ])}`
        );
      }

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

    describe('and result', () => {
      const dynamicIt = (updateField: string, updateCoffeeDto: Partial<UpdateCoffeeDto>) =>
        it(`should be full updated entity (updating ${updateField})`, async () => {
          const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);
          const updatedCoffeeResult: Coffee = await coffeeService.update(newCoffeeResult.id, updateCoffeeDto);
          const expected: Coffee = { ...newCoffeeResult, flavors: [ ...newCoffeeResult.flavors ], ...updateCoffeeDto };

          expect(updatedCoffeeResult).toBeInstanceOf(Coffee);
          expect(updatedCoffeeResult).toEqual(expected);
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
          const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);
          await coffeeService.update(newCoffeeResult.id, updateCoffeeDto);
          const foundCoffeeResult: Coffee = await coffeeService.findOne(newCoffeeResult.id);

          const expected: Coffee = { ...newCoffeeResult, flavors: [ ...newCoffeeResult.flavors ], ...updateCoffeeDto };

          expect(foundCoffeeResult).toBeInstanceOf(Coffee);
          expect(foundCoffeeResult).toEqual(expected);
        });

      for (const key of Object.keys(updateCoffeeBasicDto)) {
        const dtoKey = key as keyof UpdateCoffeeDto;
        dynamicIt(dtoKey, { [dtoKey]: updateCoffeeBasicDto[dtoKey] });
      }
      dynamicIt('all fields', updateCoffeeBasicDto);
    });

    describe('failure', () => {
      it('should throw error for absent ID', async () => {
        const absentId = Number.MAX_SAFE_INTEGER;

        await checkError(
          () => coffeeService.update(absentId, updateCoffeeBasicDto),
          `Coffee #${absentId} not found`,
          NotFoundException
        );
      });
    });
  });

  describe('remove', () => {
    it('should return `true` after deletion', async () => {
      const createCoffeeDto: CreateCoffeeDto = {
        name: 'New Coffee Name',
        brand: 'New Coffee Brand',
        flavors: [ 'new', 'coffee' ]
      };
      const newCoffeeResult: Coffee = await coffeeService.create(createCoffeeDto);

      expect(await coffeeService.remove(newCoffeeResult.id)).toBe(true);
    });

    it('should return `false` for absent ID', async () => {
      const absentId = Number.MAX_SAFE_INTEGER;

      expect(await coffeeService.remove(absentId)).toBe(false);
    });
  });
});
