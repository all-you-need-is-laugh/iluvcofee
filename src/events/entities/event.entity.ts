import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Index()
  @Column()
  name: string;

  @Column('json')
  payload: Record<string, unknown>;
}
