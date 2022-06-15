import { DataSource, QueryRunner } from 'typeorm';

export async function withQueryRunner (dataSource: DataSource, executor: (qr: QueryRunner) => void): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await executor(queryRunner);

    await queryRunner.commitTransaction();
  } catch (err: unknown) {
    await queryRunner.rollbackTransaction();

    throw err;
  } finally {
    await queryRunner.release();
  }
}
