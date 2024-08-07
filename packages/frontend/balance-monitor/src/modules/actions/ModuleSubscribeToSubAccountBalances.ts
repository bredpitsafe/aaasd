import { convertToSubscriptionEventValueDescriptor } from '@frontend/common/src/modules/actions/utils.ts';
import type { TSubAccountBalance } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { identity } from '@frontend/common/src/utils/identity.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

import type { TEmptySendBody } from './defs';

type TReceiveBody = TSubAccountBalance & {
    type: 'SubAccountBalance';
};

const descriptor = createRemoteProcedureDescriptor<TEmptySendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToSubAccountBalances,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToSubAccountBalances = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertToSubscriptionEventValueDescriptor(identity),
});
