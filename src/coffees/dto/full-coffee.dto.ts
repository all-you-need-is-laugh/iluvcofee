import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';
import { CoffeePublic } from '../entities/coffee-public.entity';

export class FullCoffeeDto implements CoffeePublic {
  @ApiProperty({ description: 'The brand of the coffee.' })
  @IsString()
  readonly brand: string;

  @ApiProperty({ example: [] })
  @IsString({ each: true })
  readonly flavors: string[];

  @ApiProperty({ description: 'The coffee ID.', example: 2 })
  @Min(0)
  @IsInt({ message: '$property must be an integer number' })
  readonly id: number;

  @ApiProperty({ description: 'The name of the coffee.' })
  @IsString()
  readonly name: string;

  @Min(0)
  @IsInt({ message: '$property must be an integer number' })
  readonly recommendations: number;
}
