import { Injectable } from '@nestjs/common';
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
    return this.coffees.find((item) => item.id === id);
  }

  create(createCoffeeDto: any) {
    this.coffees.push({
      id: ++this.lastId,
      ...createCoffeeDto,
    });
  }

  update(id: number, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      // update
    }
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
