import { ResponsePayload } from '../../src/common/entities/response-payload.entity';
import { assertArray, assertObject, assertObjectShape } from './assertions';
import { SuperTestResponse } from './types/SuperTest';

export function parseResponseData (response: SuperTestResponse): unknown {
  const { body } = response;

  assertObject(body, ResponsePayload.Succeeded({}));

  return body.data;
}

export function parseResponseDataAsArray (response: SuperTestResponse): unknown[] {
  const data = parseResponseData(response);

  assertArray(data);

  return data;
}

export function parseResponseDataWithShape <S extends object> (
  response: SuperTestResponse, shape: S
): Record<keyof S, unknown> {
  const data = parseResponseData(response);

  assertObjectShape(data, shape);

  return data;
}

export function parseResponseDataWithTemplate <T extends object> (
  response: SuperTestResponse, template: T
): Required<T> & Record<string, unknown> {
  const data = parseResponseData(response);

  assertObject(data, template);

  return data;
}

export function parseResponseError (response: SuperTestResponse): unknown {
  const { body } = response;

  assertObjectShape(body, ResponsePayload.Failed(''));

  return body.error;
}
