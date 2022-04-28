import { Coffee } from './coffee.entity';

export interface CoffeePublic extends Omit<Coffee, 'flavors'> {
  flavors: string[]
}
