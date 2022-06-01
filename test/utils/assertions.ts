import { Shape } from './types/Shape';

export function assertArray (arg: unknown): asserts arg is unknown[] {
  expect(arg).toBeArray();
}

export function assertNumber <T extends object, K extends keyof T = keyof T> (
  arg: T, key: K, min?: number, max?: number
): asserts arg is T & Record<K, number> {
  const expectation = expect(arg[key]);

  expectation.toBeNumber();

  if (min !== undefined) {
    expectation.toBeGreaterThanOrEqual(0);
  }
  if (max !== undefined) {
    expectation.toBeLessThanOrEqual(max);
  }
}

export function assertObject <T extends object> (
  arg: unknown, template?: T
): asserts arg is Required<T> & Record<string, unknown> {
  expect(arg).toBeInstanceOf(Object);

  if (template) {
    expect(arg).toMatchObject(template);
  }
}

export function assertObjectShape <S extends object> (arg: unknown, shape: S): asserts arg is Shape<S> {
  const keys = Object.keys(shape);
  expect(arg).toContainAllKeys(keys);
}
