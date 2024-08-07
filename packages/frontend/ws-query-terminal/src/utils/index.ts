import type { TQueryResult } from '../types';

export function serializeQueryResult(r: TQueryResult | object): string {
    return JSON.stringify(r, null, 2);
}
