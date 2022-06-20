import { Module, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { SharedConfigModule } from '../../config/shared-config.module';
import { Event, EventSchema } from '../../events/entities/event.entity';
import { SharedMongooseModule } from '../../mongoose/shared-mongoose.module';

@Module({
  imports: [
    SharedConfigModule.forRoot(),
    SharedMongooseModule.forRoot(),
    SharedMongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema
      }
    ]),
  ]
})
class InjectingModule {}

export class MoveEventToMongoDB1655751791601 implements MigrationInterface {
  name = 'MoveEventToMongoDB1655751791601';

  public async up (queryRunner: QueryRunner): Promise<void> {
    const { records: eventsInPostgres } = await queryRunner.query(`
      SELECT *
      FROM "Events"
    `, [], true);

    const eventModel = await this.resolveProvider<Model<Event>>(getModelToken(Event.name));
    const eventDocuments = eventsInPostgres.map(eventData => new eventModel(eventData));

    await eventModel.bulkSave(eventDocuments);

    await queryRunner.query('DROP TABLE "Events"');

    await eventModel.db.close();
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "Events" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "payload" json NOT NULL, CONSTRAINT "PK_efc6f7ffffa26a4d4fe5f383a0b" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_65bc5eb0c1ba14006531384a00" ON "Events" ("name") ');

    const eventModel = await this.resolveProvider<Model<Event>>(getModelToken(Event.name));
    const eventsInMongo = await eventModel.find().exec();

    let param = 1;
    await queryRunner.query(`
      INSERT INTO "Events"
        ("type", "name", "payload")
      VALUES
        ${eventsInMongo.map(_ => `($${param++}, $${param++}, $${param++})`).join(', ')}
    `, eventsInMongo.map(event => [ event.type, event.name, event.payload ]).flat());

    await eventModel.collection.drop();

    await eventModel.db.close();
  }

  private async resolveProvider<TInput = unknown, TResult = TInput> (typeOrToken: Type<TInput> | string | symbol): Promise<TResult> {
    const moduleRef = await NestFactory.createApplicationContext(InjectingModule);
    return await moduleRef.resolve<TInput, TResult>(typeOrToken);
  }
}
