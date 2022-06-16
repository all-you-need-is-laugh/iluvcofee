import { MigrationInterface, QueryRunner } from 'typeorm';
import { withTransaction } from '../../common/utils/withTransaction';

export class MakeFlavorsUnique1655391684283 implements MigrationInterface {
  name = 'MakeFlavorsUnique1655391684283';

  public async up (queryRunner: QueryRunner): Promise<void> {
    await withTransaction(queryRunner, async (queryRunner) => {
      const duplicatedFlavors = await queryRunner.query(`
        SELECT
          name,
          (
            SELECT id
            FROM "Flavors"
            WHERE name = dupes.name
            ORDER BY id ASC
            LIMIT 1
          ) AS id
        FROM (
          SELECT name
          FROM "Flavors"
          GROUP BY name
          HAVING COUNT(name) > 1
        ) AS dupes
      `);

      for (const flavor of duplicatedFlavors) {
        // remove all Coffees_Flavors relations with duplicated Flavor, but return Coffees.Id for removed pairs
        const { records: removedRelations } = await queryRunner.query(`
          DELETE FROM "Coffees_Flavors"
          WHERE "flavorId" IN (SELECT id FROM "Flavors" WHERE name = $1)
          RETURNING "coffeeId"
        `, [ flavor.name ], true);

        const removedCoffeeIds = [ ...new Set(removedRelations.map(relation => relation.coffeeId)) ];

        // add Coffees_Flavors relations, for Coffees.Id and Flavor.name
        let param = 2;
        await queryRunner.query(`
          INSERT INTO "Coffees_Flavors"
            ("flavorId", "coffeeId")
          VALUES
            ${removedCoffeeIds.map(_ => `($1, $${param++})`).join(', ')}
        `, [ flavor.id, ...removedCoffeeIds ]);
      }

      // remove Flavors without Coffees_Flavors relation
      await queryRunner.query(`
        DELETE FROM "Flavors" f
        WHERE id IN (
          SELECT id
          FROM "Flavors" f
          LEFT JOIN "Coffees_Flavors" cf ON cf."flavorId" = f.id
          WHERE cf."coffeeId" IS NULL
        )
        RETURNING f.*
      `, [ ], true);

      // add unique index
      await queryRunner.query(`CREATE UNIQUE INDEX "IDX_811df43cef36786888f8129d39" ON "Flavors" ("name") `);
    });
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_811df43cef36786888f8129d39"`);
  }
}
