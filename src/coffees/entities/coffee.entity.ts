import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Flavor } from './flavor.entity';

@Entity('Coffees')
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @JoinTable({ name: 'Coffees_Flavors', joinColumn: { name: 'coffeeId' }, inverseJoinColumn: { name: 'flavorId' } })
  @ManyToMany(_type => Flavor, flavor => flavor.coffees, { cascade: true, eager: true })
  flavors: Flavor[];

  @Column({ default: 0 })
  recommendations: number;
}
