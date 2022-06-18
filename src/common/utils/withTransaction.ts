import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import isPostgresError from './isPostgresError';

export interface RunInTransaction<T> {
  (manager: EntityManager): Promise<T>
}

export async function withTransaction <T> (
  arg: DataSource | QueryRunner, runInTransaction: RunInTransaction<T>, retries = 5
): Promise<T> {
  const queryRunner = (arg instanceof DataSource) ? arg.createQueryRunner() : arg;
  try {
    return await queryRunner.manager.transaction(runInTransaction);
  } catch (error) {
    if (retries > 1 && isPostgresError.TransactionAborted(error)) {
      return await withTransaction(queryRunner, runInTransaction, retries - 1);
    }
    throw error;
  } finally {
    // Release queryRunner only if we created it inside this function
    if (arg instanceof DataSource) {
      await queryRunner.release();
    }
  }
}

