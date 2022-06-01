export function assertArray (arg: unknown): asserts arg is unknown[] {
  expect(arg).toBeArray();
}

export function assertObject <T extends object> (
  arg: unknown, template?: T
): asserts arg is Required<T> & Record<string, unknown> {
  expect(arg).toBeInstanceOf(Object);

  if (template) {
    expect(arg).toMatchObject(template);
  }
}

export function assertObjectShape <S extends object> (
  arg: unknown, shape: S
): asserts arg is Record<keyof S, unknown> {
  const keys = Object.keys(shape);
  expect(arg).toContainAllKeys(keys);
}
