export class ResponsePayload<D = null, E = null> {
  readonly success: boolean;
  readonly data: D;
  readonly error: E;

  private constructor (data: D, error: E) {
    if (error === null) {
      this.success = true;
      this.data = data;
      this.error = error;

      return this;
    }

    if (data === null) {
      this.success = false;
      this.data = data;
      this.error = error;

      return this;
    }

    throw new Error(`ResponsePayload can't have both "data" and "error" as non-null!`);
  }

  static Failed<F> (error: F): ResponsePayload<null, F> {
    return new ResponsePayload(null, error);
  }

  static Succeeded<S> (data: S): ResponsePayload<S> {
    return new ResponsePayload(data, null);
  }
}
