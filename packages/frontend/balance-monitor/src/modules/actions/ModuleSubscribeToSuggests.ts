import { convertToSubscriptionEventValueDescriptor } from '@frontend/common/src/modules/actions/utils.ts';
import type { TCoinBalanceReconciliationSuggest } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

import type { TEmptySendBody } from './defs.ts';

type TReceiveBody = TCoinBalanceReconciliationSuggest & {
    type: 'Suggests';
};

const descriptor = createRemoteProcedureDescriptor<TEmptySendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToSuggests,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToSuggests = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertToSubscriptionEventValueDescriptor((payload) => payload),
});
