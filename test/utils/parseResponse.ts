import { ResponsePayload } from '../../src/common/entities/response-payload.entity';
import { assertArray, assertObject, assertObjectShape } from './assertions';
import { SafeResponse } from './types/SafeResponse';

export function parseResponseData (response: SafeResponse): unknown {
  const { body } = response;

  assertObject(body, ResponsePayload.Succeeded({}));

  return body.data;
}

export function parseResponseDataAsArray (response: SafeResponse): unknown[] {
  const data = parseResponseData(response);

  assertArray(data);

  return data;
}

export function parseResponseDataWithShape <S extends object> (
  response: SafeResponse, shape: S
): Record<keyof S, unknown> {
  const data = parseResponseData(response);

  assertObjectShape(data, shape);

  return data;
}

export function parseResponseDataWithTemplate <T extends object> (
  response: SafeResponse, template: T
): Required<T> & Record<string, unknown> {
  const data = parseResponseData(response);

  assertObject(data, template);

  return data;
}

export function parseResponseError (response: SafeResponse): unknown {
  const { body } = response;

  assertObjectShape(body, ResponsePayload.Failed(''));

  return body.error;
}
