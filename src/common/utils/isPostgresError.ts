import { DatabaseError } from 'pg-protocol';
import { QueryFailedError } from 'typeorm';

export const isPostgresError = (error: unknown): error is QueryFailedError & DatabaseError => {
  return (
    (error instanceof QueryFailedError)
    &&
    Object.keys(DatabaseError.prototype).every(key => (key in error))
  );
};
