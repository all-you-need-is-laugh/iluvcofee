export function maxNumber (bytesNumber: number, signed?: boolean): number {
  const bitsNumber = bytesNumber * 8;
  const fullRange = 2 ** bitsNumber;
  const resultingRange = signed ? fullRange / 2 : fullRange;

  return resultingRange - 1;
}
