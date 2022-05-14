import { Module } from '@nestjs/common';
import { CoffeesModule } from './coffees/coffees.module';
import { SharedTypeOrmModule } from './typeorm/shared-typeorm.module';

@Module({
  imports: [
    CoffeesModule,
    SharedTypeOrmModule.forRoot()
  ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
