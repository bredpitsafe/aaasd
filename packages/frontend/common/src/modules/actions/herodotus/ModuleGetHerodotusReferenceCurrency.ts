import type { TRobotId } from '../../../types/domain/robots.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

type TSendBody = {
    robotId: TRobotId;
};

type TReceivedBody = {
    type: 'HerodotusReferenceCurrency';
    currency: string;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceivedBody>()(
    EPlatformSocketRemoteProcedureName.GetHerodotusReferenceCurrency,
    ERemoteProcedureType.Request,
);

export const ModuleGetHerodotusReferenceCurrency = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.currency)),
});
