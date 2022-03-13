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
      flavors: ['chocolate', 'vanilla'],
    },
    {
      id: 2,
      name: 'Rotand Roast',
      brand: 'Psijco Brew',
      flavors: ['opaque'],
    },
  ];

  private lastId = this.coffees.length;

  findAll() {
    return this.coffees;
  }

  findOne(id: number) {
    const coffee = this.coffees.find((item) => item.id === id);

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const newCoffee = {
      id: ++this.lastId,
      ...createCoffeeDto,
    };

    this.coffees.push(newCoffee);

    return newCoffee;
  }

  update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = this.findOne(id);
    if (!existingCoffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    Object.assign(existingCoffee, updateCoffeeDto);
    return existingCoffee;
  }

  remove(id: number) {
    const index = this.coffees.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.coffees.splice(index, 1);
      return true;
    }

    return false;
  }
}
