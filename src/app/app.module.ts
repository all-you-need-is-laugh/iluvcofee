import { Module } from '@nestjs/common';
import { CoffeesModule } from '../coffees/coffees.module';
import { CommonModule } from '../common/common.module';
import { SharedConfigModule } from '../config/shared-config.module';
import { SharedTypeOrmModule } from '../typeorm/shared-typeorm.module';

@Module({
  imports: [
    CoffeesModule,
    CommonModule,
    SharedConfigModule.forRoot(),
    SharedTypeOrmModule.forRoot()
  ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
