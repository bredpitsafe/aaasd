import type { Scope } from '../../def/request';

export function stringifyScope(scope: Scope) {
    const sortedEntries = Object.entries(scope).sort();

    return JSON.stringify(sortedEntries);
}

export function parseScope(stringifiedEntries: string): Scope {
    return Object.fromEntries(JSON.parse(stringifiedEntries));
}
