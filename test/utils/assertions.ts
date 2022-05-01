export function assertArray (arg: unknown): asserts arg is unknown[] {
  expect(arg).toBeArray();
}

export function assertObject <T extends object>
(arg: unknown, template?: T): asserts arg is ({ -readonly [Key in keyof T]-?: T[Key] } & Record<string, unknown>) {
  expect(arg).toBeInstanceOf(Object);

  if (template) {
    expect(arg).toMatchObject(template);
  }
}

export function assertObjectShape <T extends object>
(arg: unknown, template: T): asserts arg is Record<keyof T, unknown> {
  const keys = Object.keys(template);
  expect(arg).toContainAllKeys(keys);
}
