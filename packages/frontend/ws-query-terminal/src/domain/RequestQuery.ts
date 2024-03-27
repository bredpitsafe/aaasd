import { Opaque } from '@frontend/common/src/types';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { ValueDescriptorFactory } from '@frontend/common/src/utils/ValueDescriptor';

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

const RequestQueryFail = FailFactory('RequestQuery');
export const SAVED_QUERY_NOT_FOUND = RequestQueryFail('UNKNOWN');
export const RequestQueryDesc = ValueDescriptorFactory<
    TRequestQuery,
    typeof SAVED_QUERY_NOT_FOUND
>();
