interface CheckRejection {
  (fn: () => Promise<unknown>, message: string, ErrorConstructor?: unknown): Promise<unknown>
}

export const checkRejection: CheckRejection = async (fn, message, ErrorConstructor) => {
  const rejected = expect(fn).rejects;

  const checkMessagePromise = rejected.toHaveProperty('message', message);

  if (ErrorConstructor === undefined) {
    return await checkMessagePromise;
  }

  return await Promise.all([
    rejected.toBeInstanceOf(ErrorConstructor),
    checkMessagePromise
  ]);
};
