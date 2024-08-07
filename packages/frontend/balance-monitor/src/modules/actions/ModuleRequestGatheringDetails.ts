import type { TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import type { TEmptySendBody } from './defs.ts';

type TReceiveBody = {
    type: 'TransferDetails';
    exchanges: TExchangeId[];
};

const descriptor = createRemoteProcedureDescriptor<TEmptySendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RequestGatheringDetails,
    ERemoteProcedureType.Request,
);

export const ModuleRequestGatheringDetails = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload)),
});
