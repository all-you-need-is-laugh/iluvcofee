import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesModule } from './coffees/coffees.module';

@Module({
  imports: [
    CoffeesModule,
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: 'iluvcofee',
      host: 'localhost',
      password: 'postgres',
      port: 5432,
      synchronize: process.env.NODE_ENV !== 'production',
      type: 'postgres',
      username: 'postgres',
    })
  ],
  controllers: [ ],
  providers: [ ],
})
export class AppModule {}
