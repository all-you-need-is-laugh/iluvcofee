import { Module } from '@nestjs/common';
import { Event, EventSchema } from '../events/entities/event.entity';
import { SharedMongooseModule } from '../mongoose/shared-mongoose.module';

import { SharedTypeOrmModule } from '../typeorm/shared-typeorm.module';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

@Module({
  imports: [
    SharedMongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema
      }
    ]),
    SharedTypeOrmModule.forFeature([ Coffee, Flavor ])
  ],
  controllers: [ CoffeesController ],
  providers: [ CoffeesService ],
})
export class CoffeesModule {}
