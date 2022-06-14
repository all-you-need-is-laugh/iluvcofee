import { Response } from 'supertest';

interface ResponseChecker {
  (res: Response): boolean
}

export const statusChecker = (expectedStatus: number, textMaxLength = 200): ResponseChecker => (res) => {
  const { status, text } = res;
  if (status === expectedStatus) return true;

  const prefix = '... (trimmed)';
  const content = text.length > textMaxLength ? `${text.substring(0, textMaxLength - prefix.length)}${prefix}` : text;

  throw new Error(`Expected status ${expectedStatus}, but got ${status}. Response text: ${content}`);
};
