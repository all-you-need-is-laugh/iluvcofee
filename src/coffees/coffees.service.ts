import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: [ 'chocolate', 'vanilla' ],
    },
    {
      id: 2,
      name: 'Rota Roast',
      brand: 'Psycho Brew',
      flavors: [ 'opaque' ],
    },
  ];

  private lastId = this.coffees.length;

  async findAll (): Promise<Coffee[]> {
    return this.coffees;
  }

  async findOne (id: number): Promise<Coffee> {
    const coffee = this.coffees.find((item) => item.id === id);

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return coffee;
  }

  async create (createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    const newCoffee = Object.assign(new Coffee(), { id: ++this.lastId }, createCoffeeDto);

    this.coffees.push(newCoffee);

    return newCoffee;
  }

  async update (id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    const index = this.coffees.findIndex((item) => item.id === id);
    const existingCoffee = this.coffees[index];
    if (index === -1 || existingCoffee === undefined) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    const updatedCoffee = Object.assign(new Coffee(), existingCoffee, updateCoffeeDto);
    this.coffees[index] = updatedCoffee;
    return updatedCoffee;
  }

  async remove (id: number): Promise<boolean> {
    const index = this.coffees.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.coffees.splice(index, 1);
      return true;
    }

    return false;
  }
}
