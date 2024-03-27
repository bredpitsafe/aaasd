export type QueryResult = Array<string | object>;

export function serializeQueryResult(r: QueryResult | object): string {
    return JSON.stringify(r, null, 2);
}
