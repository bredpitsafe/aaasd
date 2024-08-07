import type { TConfigId } from '@backend/nse-risk-manager/src/def/config.ts';

import type { EComponentConfigType } from '../../../types/domain/component.ts';
import type { TServerId } from '../../../types/domain/servers.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

type TSendBody = {
    nodeId: TServerId;
    configType: EComponentConfigType;
    config: string;
    name?: string;
    kind?: string;
};

type TReceiveBody = {
    type: 'ConfigCreated';
    id: TConfigId;
    digest: string;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.CreateConfig,
    ERemoteProcedureType.Update,
);

export const ModuleCreateConfig = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload)),
});
