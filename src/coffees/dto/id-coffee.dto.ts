import { PickType } from '@nestjs/swagger';

import { FullCoffeeDto } from './full-coffee.dto';

export class IdCoffeeDto extends PickType(FullCoffeeDto, [ 'id' ] as const) { }
