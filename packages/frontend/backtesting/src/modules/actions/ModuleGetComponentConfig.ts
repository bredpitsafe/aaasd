import { TComponentConfig } from '@frontend/common/src/handlers/def';
import { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import { TComponentId } from '@frontend/common/src/types/domain/component';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';

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
