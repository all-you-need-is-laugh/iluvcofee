import { DatabaseError } from 'pg-protocol';
import { QueryFailedError } from 'typeorm';

type PostgresError = QueryFailedError & DatabaseError;
type PostgresErrorWithCode <T extends string> = PostgresError & { code: T };

const isPostgresError = (error: unknown): error is PostgresError => {
  return (
    (error instanceof QueryFailedError)
    &&
    Object.keys(DatabaseError.prototype).every(key => (key in error))
  );
};

const postgresErrorChecker = <T extends string>(code: T) => {
  return (error: unknown): error is PostgresErrorWithCode<T> => isPostgresError(error) && error.code === code;
};

isPostgresError.DuplicateConstraint = postgresErrorChecker('23505');
isPostgresError.OutOfRange = postgresErrorChecker('22003');
isPostgresError.TransactionAborted = postgresErrorChecker('25P02');

export default isPostgresError;
