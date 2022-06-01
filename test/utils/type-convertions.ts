import { assertArray, assertObject } from './assertions';

export function asArray (arg: unknown): unknown[] {
  assertArray(arg);

  return arg;
}

export function asObject (arg: unknown): Record<string, unknown> {
  assertObject(arg);

  return arg;
}
