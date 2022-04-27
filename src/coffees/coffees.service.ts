import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isPostgresError } from '../shared/utils/isPostgresError';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  constructor (
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>
  ) {}

  async findAll (): Promise<Coffee[]> {
    return this.coffeeRepository.find();
  }

  async findOne (id: number): Promise<Coffee> {
    let coffee;

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

  async create (createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    const coffee = await this.coffeeRepository.create(createCoffeeDto);

    return this.coffeeRepository.save(coffee);
  }

  async update (id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    let coffee;

    try {
      coffee = await this.coffeeRepository.preload({
        id,
        ...updateCoffeeDto
      });
    } catch (error) {
      if (!isPostgresError(error) || error.code !== '22003') {
        throw error;
      }
    }

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return this.coffeeRepository.save(coffee);
  }

  async remove (id: number): Promise<boolean> {
    let coffee;

    try {
      coffee = await this.findOne(id);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (!coffee) return false;

    await this.coffeeRepository.remove(coffee);

    return true;
  }
}
