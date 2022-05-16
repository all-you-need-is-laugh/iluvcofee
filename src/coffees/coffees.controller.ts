import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CoffeePublic } from './entities/coffee-public.entity';

@Controller('coffees')
export class CoffeesController {
  constructor (private readonly coffeesService: CoffeesService) {}

  @Public()
  @Get()
  async findAll (@Query() paginationQuery: PaginationQueryDto): Promise<CoffeePublic[]> {
    return this.coffeesService.findAll(paginationQuery);
  }

  @Get(':id')
  async findOne (@Param('id') id: number): Promise<CoffeePublic> {
    return this.coffeesService.findOne(id);
  }

  @Post()
  async create (@Body() createCoffeeDto: CreateCoffeeDto): Promise<CoffeePublic> {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  async update (@Param('id') id: number, @Body() updateCoffeeDto: UpdateCoffeeDto): Promise<CoffeePublic> {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  @Header('content-type', 'application/json; charset=utf-8')
  async remove (@Param('id') id: number): Promise<boolean> {
    return this.coffeesService.remove(id);
  }

  @Post(':id/recommend')
  async recommend (@Param('id') id: number): Promise<boolean> {
    return this.coffeesService.recommendCoffee(id);
  }
}
