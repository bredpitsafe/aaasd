import { camelCase, mapKeys, mapValues, snakeCase } from 'lodash-es';

import type { TDbDashboard, TGrpcDashboard } from '../def/dashboard.ts';
import { toGrcpKind } from './enum-convertors/kind.convertor.ts';
import { toGrcpStatus } from './enum-convertors/status.convertor.ts';

/* eslint-disable */
export function fromDB<T extends Record<string, any>>(obj: T): T {
    const mappedValues = mapValues(obj, (v) => v) as T;
    return mapKeys(mappedValues, (_, k) => camelCase(k)) as T;
}

export function toDB<T extends Record<string, any>>(obj: T): Record<string, any> {
    return mapKeys(obj, (_, k) => snakeCase(k));
}

export const fromDbDashboard = (dbDashboard: TDbDashboard): TGrpcDashboard => ({
    ...dbDashboard,
    kind: toGrcpKind(dbDashboard.kind),
    status: toGrcpStatus(dbDashboard.status),
});
