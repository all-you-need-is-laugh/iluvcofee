import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { IdCoffeeDto } from './dto/id-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { CoffeePublic } from './entities/coffee-public.entity';

@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {
  constructor (private readonly coffeesService: CoffeesService) {}

  @Public()
  @Get()
  async findAll (@Query() paginationQuery: PaginationQueryDto): Promise<CoffeePublic[]> {
    return await this.coffeesService.findAll(paginationQuery);
  }

  @Public()
  @Get(':id')
  async findOne (@Param() { id }: IdCoffeeDto): Promise<CoffeePublic> {
    return await this.coffeesService.findOne(id);
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiResponse({ status: 200, description: 'OK' })
  @Post()
  async create (@Body() createCoffeeDto: CreateCoffeeDto): Promise<CoffeePublic> {
    return await this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  async update (@Param() { id }: IdCoffeeDto, @Body() updateCoffeeDto: UpdateCoffeeDto): Promise<CoffeePublic> {
    return await this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  async remove (@Param() { id }: IdCoffeeDto): Promise<boolean> {
    return await this.coffeesService.remove(id);
  }

  @Post(':id/recommend')
  async recommend (@Param() { id }: IdCoffeeDto): Promise<boolean> {
    return await this.coffeesService.recommendCoffee(id);
  }
}
