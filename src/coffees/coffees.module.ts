import { Module } from '@nestjs/common';

import { Event } from '../events/entities/event.entity';
import { SharedTypeOrmModule } from '../typeorm/shared-typeorm.module';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

@Module({
  imports: [ SharedTypeOrmModule.forFeature([ Coffee, Flavor, Event ]) ],
  controllers: [ CoffeesController ],
  providers: [ CoffeesService ],
})
export class CoffeesModule {}
