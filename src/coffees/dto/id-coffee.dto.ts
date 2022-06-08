import { PickType } from '@nestjs/mapped-types';
import { FullCoffeeDto } from './full-coffee.dto';

export class IdCoffeeDto extends PickType(FullCoffeeDto, [ 'id' ] as const) { }
