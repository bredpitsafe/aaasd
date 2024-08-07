import type {
    TStmBalance,
    TSubscribeToStmBalancesRequestPayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmBalances.schema';
import type { TStmKey } from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { TSubscriptionEvent } from '@common/rx';
import { createRemoveEvent, createSubscribedEvent, createUpdateEvent } from '@common/rx';
import { assertNever } from '@common/utils/src/assert.ts';

import { EMPTY_ARRAY } from '../../utils/const';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';
import type { TSubscribeToStmBalancesResponsePayload } from './defs';

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToStmBalancesRequestPayload,
    TSubscribeToStmBalancesResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToStmBalances, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToStmBalances = createRemoteProcedureCall(subscriptionDescriptor)({
    getPipe: () => {
        let index = 0;

        return mapValueDescriptor(
            ({ value }): TValueDescriptor2<TSubscriptionEvent<TStmBalance[], TStmKey[]>> => {
                const { payload } = value;
                const { type } = payload;

                if (type === 'StmBalancesSubscribed') {
                    return createSyncedValueDescriptor(
                        createSubscribedEvent({ platformTime: null, index: index++ }),
                    );
                }

                if (type === 'StmBalancesUpdated') {
                    return createSyncedValueDescriptor(
                        createUpdateEvent<TStmBalance[]>(payload.updated),
                    );
                }

                if (type === 'StmBalancesRemoved') {
                    return createSyncedValueDescriptor(
                        createRemoveEvent<TStmKey[]>(payload.removed ?? EMPTY_ARRAY),
                    );
                }

                assertNever(type);
            },
        );
    },
});
