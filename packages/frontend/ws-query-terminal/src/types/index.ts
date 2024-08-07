import type { Opaque } from '@common/types';

export type TQueryResult = Array<string | object>;
type TRequestQueryId = Opaque<'TRequestQueryId', number>;

export enum ERequestQueryType {
    Auto = 'Auto',
    Manual = 'Manual',
}

export type TRequestQuery = {
    id: TRequestQueryId;
    name: string;
    query: string;
    lastRequestTs: number;
    type: ERequestQueryType;
};
