import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Coffee } from './coffee.entity';

@Entity('Flavors')
export class Flavor {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  name: string;

  @ManyToMany(_type => Coffee, coffee => coffee.flavors)
  coffees: Coffee[];
}
