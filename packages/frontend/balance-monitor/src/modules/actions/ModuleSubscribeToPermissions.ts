import { convertToSubscriptionEventValueDescriptor } from '@frontend/common/src/modules/actions/utils.ts';
import type { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

import type { TEmptySendBody } from './defs';

type TReceiveBody = {
    type: 'Permissions';
    availableTabs: EBalanceMonitorLayoutPermissions[];
};

const descriptor = createRemoteProcedureDescriptor<TEmptySendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToPermissions,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToPermissions = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertToSubscriptionEventValueDescriptor((payload) => payload.availableTabs),
});
