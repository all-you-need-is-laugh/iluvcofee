import { IsInt, IsString, Min } from 'class-validator';
import { CoffeePublic } from '../entities/coffee-public.entity';

export class FullCoffeeDto implements CoffeePublic {
  @IsString()
  readonly brand: string;

  @IsString({ each: true })
  readonly flavors: string[];

  @Min(0)
  @IsInt({ message: '$property must be an integer number' })
  readonly id: number;

  @IsString()
  readonly name: string;

  @Min(0)
  @IsInt({ message: '$property must be an integer number' })
  readonly recommendations: number;
}
