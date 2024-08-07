import type { TBacktestingRun } from '../../../types/domain/backtestings.ts';
import type { TComponentId } from '../../../types/domain/component.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import type { TComponentConfig } from '../def.ts';

type TSendBody = {
    id: TComponentId;
    btRunNo?: TBacktestingRun['btRunNo'];
};

type TReceiveBody = TComponentConfig;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.GetComponentConfig,
    ERemoteProcedureType.Request,
);

export const ModuleGetComponentConfig = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor(({ value }) => value.payload),
});
