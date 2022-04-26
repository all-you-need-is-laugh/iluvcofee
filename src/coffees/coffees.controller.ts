import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

@Controller('coffees')
export class CoffeesController {
  constructor (private readonly coffeeService: CoffeesService) {}

  @Get()
  async findAll (): Promise<Coffee[]> {
    return this.coffeeService.findAll();
  }

  @Get(':id')
  async findOne (@Param('id') id: number): Promise<Coffee> {
    return this.coffeeService.findOne(id);
  }

  @Post()
  async create (@Body() createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    return this.coffeeService.create(createCoffeeDto);
  }

  @Patch(':id')
  async update (@Param('id') id: number, @Body() updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    return this.coffeeService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  @Header('content-type', 'application/json; charset=utf-8')
  async remove (@Param('id') id: number): Promise<boolean> {
    return this.coffeeService.remove(id);
  }
}
