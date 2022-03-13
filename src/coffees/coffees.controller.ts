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

@Controller('coffees')
export class CoffeesController {
  @Get()
  listAll(@Query() paginationQuery) {
    const { limit = 10, offset = 0 } = paginationQuery;
    return `All coffees: ${limit} rows starting from ${offset}`;
  }

  @Post()
  @HttpCode(HttpStatus.GONE)
  create(@Body() body) {
    return `"${body.name}" added!`;
  }

  @Get(':id')
  read(@Param('id') id) {
    return `Coffee with ID #${id}`;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return `Coffee with ID #${id} is updated with values: ${JSON.stringify(
      body,
    )}`;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return `Coffee with ID #${id} removed`;
  }
}
