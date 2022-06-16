import { DataSource, QueryRunner } from 'typeorm';
import isPostgresError from './isPostgresError';

export interface ExecuteWithQueryRunner<T> {
  (qr: QueryRunner): Promise<T>
}

export async function withTransaction <T> (
  arg: DataSource | QueryRunner, execute: ExecuteWithQueryRunner<T>, retries = 5
): Promise<T> {
  const queryRunner = (arg instanceof DataSource) ? arg.createQueryRunner() : arg;

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await execute(queryRunner);

    await queryRunner.commitTransaction();

    return result;
  } catch (error: unknown) {
    await queryRunner.rollbackTransaction();

    if (retries > 1 && isPostgresError.TransactionAborted(error)) {
      // Don't await retry Promise to make possible release of queryRunner in `finally` branch
      // eslint-disable-next-line @typescript-eslint/return-await
      return withTransaction(arg, execute, retries - 1);
    }

    throw error;
  } finally {
    // Release queryRunner only if we created it inside this function
    if (arg instanceof DataSource) {
      await queryRunner.release();
    }
  }
}
