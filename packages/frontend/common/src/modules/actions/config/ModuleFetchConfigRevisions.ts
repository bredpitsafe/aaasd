import type { Nanoseconds } from '@common/types';

import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import type { EFetchHistoryDirection, TComponentConfig } from '../def.ts';

export type TConfigRevisionLookup = Pick<
    TComponentConfig,
    'componentId' | 'componentKind' | 'componentName' | 'digest' | 'platformTime' | 'user'
> & {
    fingerprint: string;
};

type TSendBody = {
    id: TConfigRevisionLookup['componentId'];
    params: {
        limit: number;
        direction: EFetchHistoryDirection;
        platformTime: Nanoseconds;
    };
};

type TReceiveBody = {
    type: 'ConfigRevisions';
    revisions: TConfigRevisionLookup[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchConfigRevisions,
    ERemoteProcedureType.Request,
);

export const ModuleFetchConfigRevisions = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.revisions)),
});
