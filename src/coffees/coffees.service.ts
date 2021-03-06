import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { DataSource, Repository } from 'typeorm';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import isPostgresError from '../common/utils/isPostgresError';
import { withTransaction } from '../common/utils/withTransaction';
import { Event } from '../events/entities/event.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CoffeePublic } from './entities/coffee-public.entity';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

@Injectable()
export class CoffeesService {
  constructor (
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    @InjectConnection()
    private readonly dataSource: DataSource
  ) {}

  async findAll (paginationQuery?: PaginationQueryDto): Promise<CoffeePublic[]> {
    const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = paginationQuery || {};
    const coffees = await this.coffeeRepository.find({
      skip: offset,
      take: limit
    });

    return coffees.map(coffee => this.formatCoffeeToPublic(coffee));
  }

  async findCoffeeRecommendations (id: number): Promise<Event[]> {
    return await this.eventModel.find({ payload: { coffeeId: id } }).exec();
  }

  async findOne (id: number): Promise<CoffeePublic> {
    const coffee = await this.findOneCoffee(id);

    return this.formatCoffeeToPublic(coffee);
  }

  async create (createCoffeeDto: CreateCoffeeDto): Promise<CoffeePublic> {
    const coffee = await withTransaction(this.dataSource, async (manager) => {
      const flavors = await this.preloadFlavorsByName(createCoffeeDto.flavors, manager.getRepository(Flavor));

      const coffeeEntity = manager.create(Coffee, { ...createCoffeeDto, flavors });
      return await manager.save(coffeeEntity);
    });

    return this.formatCoffeeToPublic(coffee);
  }

  async update (id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<CoffeePublic> {
    const { flavors: updateFlavors, ...updateRest } = updateCoffeeDto;
    const preloadDto: Partial<Coffee> = { id, ...updateRest };

    await withTransaction(this.dataSource, async (manager) => {
      if (updateFlavors) {
        preloadDto.flavors = await this.preloadFlavorsByName(updateFlavors, manager.getRepository(Flavor));
      }

      let coffee: Coffee | undefined;

      try {
        coffee = await manager.preload<Coffee>(Coffee, preloadDto);
      } catch (error) {
        if (!isPostgresError.OutOfRange(error)) {
          throw error;
        }
      }

      if (!coffee) {
        throw new NotFoundException(`Coffee #${id} not found`);
      }

      await manager.save(coffee);
    });

    return await this.findOne(id);
  }

  async recommendCoffee (id: number): Promise<boolean> {
    const coffee = await this.coffeeRepository.preload({ id });

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    // TODO: [refactor] Extract to some kind "perform event" method
    try {
      await new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: { coffeeId: id },
      }).save();

      await this.coffeeRepository.update({ id }, {
        recommendations: () => `recommendations + 1`
      });

      return true;
    } catch (error) {
      // TODO: [logger] replace with logger
      console.log('CoffeesService::recommendCoffee failed with', error);

      return false;
    }
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
      if (!isPostgresError.OutOfRange(error)) {
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

  private async preloadFlavorByName (name: string, flavorRepository: Repository<Flavor>): Promise<Flavor> {
    const existingFlavor = await flavorRepository.findOneBy({ name });

    if (existingFlavor) { return existingFlavor; }

    const flavor = flavorRepository.create({ name });

    try {
      return await flavorRepository.save(flavor);
    } catch (error) {
      if (isPostgresError.DuplicateConstraint(error)) {
        return flavor;
      }

      throw error;
    }
  }

  private async preloadFlavorsByName (names: string[], flavorRepository: Repository<Flavor>): Promise<Flavor[]> {
    const uniqueNames = [ ...new Set(names) ];
    if (uniqueNames.length !== names.length) {
      throw new BadRequestException(`flavors array must not have duplicates`);
    }
    return await Promise.all(names.map(name => this.preloadFlavorByName(name, flavorRepository)));
  }
}
