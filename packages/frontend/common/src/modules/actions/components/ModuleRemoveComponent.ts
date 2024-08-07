import type { TComponentId } from '../../../types/domain/component.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';

type TSendBody = {
    id: TComponentId;
};

type TReceiveBody = {
    id: TComponentId;
    type: 'ComponentRemoved';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RemoveComponent,
    ERemoteProcedureType.Update,
);

export const ModuleRemoveComponent = createRemoteProcedureCall(descriptor)();
