export class ResponsePayload<D = null, E = null> {
  readonly success: boolean;
  readonly data: D | null;
  readonly error: E | null;

  private constructor (data: D, error: E) {
    if (error === null) {
      this.success = true;
      this.data = data;
      this.error = null;
    } else {
      this.success = false;
      this.data = null;
      this.error = error;
    }
  }

  static Failed<F> (error: F): ResponsePayload<null, F> {
    return new ResponsePayload(null, error);
  }
  static Succeeded<S> (data: S): ResponsePayload<S> {
    return new ResponsePayload(data, null);
  }
}
