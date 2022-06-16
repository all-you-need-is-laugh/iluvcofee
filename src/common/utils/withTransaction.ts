import { DataSource, QueryRunner } from 'typeorm';

export interface ExecuteWithQueryRunner<T> {
  (qr: QueryRunner): Promise<T>
}

export async function withTransaction <T> (dataSource: DataSource , execute: ExecuteWithQueryRunner<T>): Promise<T>;
export async function withTransaction <T> (queryRunner: QueryRunner , execute: ExecuteWithQueryRunner<T>): Promise<T>;
export async function withTransaction <T> (
  arg: DataSource | QueryRunner,
  execute: ExecuteWithQueryRunner<T>
): Promise<T> {
  const queryRunner = (arg instanceof DataSource) ? arg.createQueryRunner() : arg;

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
    // Release queryRunner only if we created it inside this function
    if (arg instanceof DataSource) {
      await queryRunner.release();
    }
  }
}
