import { OmitType } from '@nestjs/swagger';
import { FullCoffeeDto } from './full-coffee.dto';

export class CreateCoffeeDto extends OmitType(FullCoffeeDto, [ 'id', 'recommendations' ] as const) { }
