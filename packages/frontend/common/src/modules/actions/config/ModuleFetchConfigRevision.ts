import type { TComponentId } from '../../../types/domain/component.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import type { TConfigRevisionLookup } from './ModuleFetchConfigRevisions.ts';

export type TConfigRevision = TConfigRevisionLookup & { config: string };

type TSendBody = {
    id: TComponentId;
    digest: string;
};

type TReceiveBody = {
    type: 'ConfigRevision';
    revisions: TConfigRevision[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchConfigRevision,
    ERemoteProcedureType.Request,
);

export const ModuleFetchConfigRevision = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.revisions)),
});
