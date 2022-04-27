export function assertObject <T extends object>
(arg: unknown, template?: T): asserts arg is ({ -readonly [Key in keyof T]-?: T[Key] } & Record<string, unknown>) {
  expect(arg).toBeInstanceOf(Object);

  if (template) {
    expect(arg).toMatchObject(template);
  }
}
