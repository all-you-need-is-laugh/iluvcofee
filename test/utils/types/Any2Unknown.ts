type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;

type Any2UnknownRecursively<T> =
  // Tuples
  T extends [infer Tuple1, ...infer TupleRest]
    ? [Any2Unknown<Tuple1>, ...Any2UnknownRecursively<TupleRest>]
    // Arrays
    : T extends (infer Item)[]
      ? Any2Unknown<Item>[]
      // Functions
      // : T extends (...args: infer Params) => (infer Result)
      //   ? (...args: Any2UnknownRecursively<Params>) => Any2Unknown<Result>
      // Objects
      : T extends object
        ? { [Key in keyof T]: Any2Unknown<T[Key]> }
        : T

export type Any2Unknown<T> = IfAny<T, unknown, Any2UnknownRecursively<T>>;
