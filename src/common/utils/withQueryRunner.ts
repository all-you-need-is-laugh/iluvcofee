import { DataSource, QueryRunner } from 'typeorm';

export interface ExecuteWithQueryRunner<T> {
  (qr: QueryRunner): Promise<T>
}

export async function withQueryRunner <T> (dataSource: DataSource, execute: ExecuteWithQueryRunner<T>): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await execute(queryRunner);

    await queryRunner.commitTransaction();

    return result;
  } catch (err: unknown) {
    await queryRunner.rollbackTransaction();

    throw err;
  } finally {
    await queryRunner.release();
  }
}
