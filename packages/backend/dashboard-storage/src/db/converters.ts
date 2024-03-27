import { camelCase, mapKeys, mapValues, snakeCase } from 'lodash-es';

/* eslint-disable */
export function fromDB<T extends Record<string, any>>(obj: T): T {
  const mappedValues = mapValues(obj, (v) => v) as T;
  return mapKeys(mappedValues, (_, k) => camelCase(k)) as T;
}

export function toDB<T extends Record<string, any>>(obj: T): Record<string, any> {
  return mapKeys(obj, (_, k) => snakeCase(k));
}
