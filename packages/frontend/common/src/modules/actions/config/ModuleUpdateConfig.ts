import type { TConfigId } from '@backend/nse-risk-manager/src/def/config.ts';

import type { TComponentId } from '../../../types/domain/component.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

type TId = TConfigId | TComponentId;
type TSendBody = {
    id: TId;
    command: 'UpdateConfig';
    newConfigRaw: string;
    currentDigest?: string;
};

export type TReceiveBody = {
    id: TConfigId;
    digest: string;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ExecCommand,
    ERemoteProcedureType.Update,
);

export const ModuleUpdateConfig = createRemoteProcedureCall(descriptor)({
    getParams: (params: TWithSocketTarget & Omit<TSendBody, 'command'>) => {
        return {
            ...params,
            command: 'UpdateConfig',
        };
    },
    getPipe: () => {
        return mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload));
    },
});
