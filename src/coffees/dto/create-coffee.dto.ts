import { PickType } from '@nestjs/swagger';
import { FullCoffeeDto } from './full-coffee.dto';

export class CreateCoffeeDto extends PickType(FullCoffeeDto, [ 'brand', 'flavors', 'name' ] as const) { }
