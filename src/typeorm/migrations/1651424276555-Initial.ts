import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1651424276555 implements MigrationInterface {
  name = 'Initial1651424276555';

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "Events" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "payload" json NOT NULL, CONSTRAINT "PK_efc6f7ffffa26a4d4fe5f383a0b" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_65bc5eb0c1ba14006531384a00" ON "Events" ("name") ');
    await queryRunner.query('CREATE TABLE "Flavors" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_cd4ec910183e2f480a6b248254a" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TABLE "Coffees" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "brand" character varying NOT NULL, "recommendations" integer NOT NULL DEFAULT \'0\', CONSTRAINT "PK_49ed1faedf80ef5d56ccc88a6ce" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TABLE "Coffees_Flavors" ("coffeeId" integer NOT NULL, "flavorId" integer NOT NULL, CONSTRAINT "PK_a835355bdf645c03a91f295aa00" PRIMARY KEY ("coffeeId", "flavorId"))');
    await queryRunner.query('CREATE INDEX "IDX_429473a33191ac83c88803b892" ON "Coffees_Flavors" ("coffeeId") ');
    await queryRunner.query('CREATE INDEX "IDX_81249ae4015eda0a206909c0cb" ON "Coffees_Flavors" ("flavorId") ');
    await queryRunner.query('ALTER TABLE "Coffees_Flavors" ADD CONSTRAINT "FK_429473a33191ac83c88803b8928" FOREIGN KEY ("coffeeId") REFERENCES "Coffees"("id") ON DELETE CASCADE ON UPDATE CASCADE');
    await queryRunner.query('ALTER TABLE "Coffees_Flavors" ADD CONSTRAINT "FK_81249ae4015eda0a206909c0cb5" FOREIGN KEY ("flavorId") REFERENCES "Flavors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "Coffees_Flavors" DROP CONSTRAINT "FK_81249ae4015eda0a206909c0cb5"');
    await queryRunner.query('ALTER TABLE "Coffees_Flavors" DROP CONSTRAINT "FK_429473a33191ac83c88803b8928"');
    await queryRunner.query('DROP INDEX "public"."IDX_81249ae4015eda0a206909c0cb"');
    await queryRunner.query('DROP INDEX "public"."IDX_429473a33191ac83c88803b892"');
    await queryRunner.query('DROP TABLE "Coffees_Flavors"');
    await queryRunner.query('DROP TABLE "Coffees"');
    await queryRunner.query('DROP TABLE "Flavors"');
    await queryRunner.query('DROP INDEX "public"."IDX_65bc5eb0c1ba14006531384a00"');
    await queryRunner.query('DROP TABLE "Events"');
  }
}
