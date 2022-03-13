import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeeService: CoffeesService) {}

  @Get()
  findAll(@Query() paginationQuery) {
    // const { limit = 10, offset = 0 } = paginationQuery;
    return this.coffeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeeService.findOne(parseInt(id));
  }

  @Post()
  @HttpCode(HttpStatus.GONE)
  create(@Body() body) {
    return this.coffeeService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.coffeeService.update(parseInt(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeeService.remove(parseInt(id));
  }
}
