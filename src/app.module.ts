import { Module } from '@nestjs/common';
import { CoffeesModule } from './coffees/coffees.module';
import { SharedConfigModule } from './config/shared-config.module';
import { SharedTypeOrmModule } from './typeorm/shared-typeorm.module';

@Module({
  imports: [
    CoffeesModule,
    SharedConfigModule.forRoot(),
    SharedTypeOrmModule.forRoot()
  ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
