import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { isPostgresError } from '../common/utils/isPostgresError';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CoffeePublic } from './entities/coffee-public.entity';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.enitity';

@Injectable()
export class CoffeesService {
  constructor (
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>
  ) {}

  async findAll (paginationQuery?: PaginationQueryDto): Promise<CoffeePublic[]> {
    const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = paginationQuery || {};
    const coffees = await this.coffeeRepository.find({
      skip: offset,
      take: limit
    });

    return coffees.map(coffee => this.formatCoffeeToPublic(coffee));
  }

  async findOne (id: number): Promise<CoffeePublic> {
    const coffee = await this.findOneCoffee(id);

    return this.formatCoffeeToPublic(coffee);
  }

  async create (createCoffeeDto: CreateCoffeeDto): Promise<CoffeePublic> {
    const flavors = await this.preloadFlavorsByName(createCoffeeDto.flavors);

    const coffee = await this.coffeeRepository.create({ ...createCoffeeDto, flavors });

    await this.coffeeRepository.save(coffee);

    return this.formatCoffeeToPublic(coffee);
  }

  async update (id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<CoffeePublic> {
    let coffee: Coffee | undefined;

    const { flavors: updateFlavors, ...updateRest } = updateCoffeeDto;
    const preloadDto: Partial<Coffee> = { id, ...updateRest };

    if (updateFlavors) {
      preloadDto.flavors = await this.preloadFlavorsByName(updateFlavors);
    }

    try {
      coffee = await this.coffeeRepository.preload(preloadDto);
    } catch (error) {
      if (!isPostgresError(error) || error.code !== '22003') {
        throw error;
      }
    }

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    await this.coffeeRepository.save(coffee);

    return this.findOne(id);
  }

  async remove (id: number): Promise<boolean> {
    let coffee: Coffee | null = null;

    try {
      coffee = await this.findOneCoffee(id);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (!coffee) return false;

    await this.coffeeRepository.remove(coffee);

    return true;
  }

  private async findOneCoffee (id: number): Promise<Coffee> {
    let coffee: Coffee | null = null;

    try {
      coffee = await this.coffeeRepository.findOneBy({ id });
    } catch (error) {
      if (!isPostgresError(error) || error.code !== '22003') {
        throw error;
      }
    }

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return coffee;
  }

  private formatCoffeeToPublic (coffee: Coffee): CoffeePublic {
    return { ...coffee, flavors: coffee.flavors.map(flavor =>  flavor.name) };
  }

  private async preloadFlavorByName (name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOneBy({ name });

    if (existingFlavor) { return existingFlavor; }

    return this.flavorRepository.create({ name });
  }

  private async preloadFlavorsByName (names: string[]): Promise<Flavor[]> {
    return await Promise.all(names.map(name => this.preloadFlavorByName(name)));
  }
}
