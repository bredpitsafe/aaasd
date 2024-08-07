import type {
    TStmKey,
    TStmPosition,
    TSubscribeToStmPositionsRequestPayload,
    TSubscribeToStmPositionsResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { TSubscriptionEvent } from '@common/rx';
import { createRemoveEvent, createSubscribedEvent, createUpdateEvent } from '@common/rx';
import { assertNever } from '@common/utils/src/assert.ts';

import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToStmPositionsRequestPayload,
    TSubscribeToStmPositionsResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToStmPositions, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToStmPositions = createRemoteProcedureCall(subscriptionDescriptor)({
    getPipe: () => {
        let index = 0;

        return mapValueDescriptor(
            ({ value }): TValueDescriptor2<TSubscriptionEvent<TStmPosition[], TStmKey[]>> => {
                const { payload } = value;
                const { type } = payload;

                if (type === 'StmPositionsSubscribed') {
                    return createSyncedValueDescriptor(
                        createSubscribedEvent({ platformTime: null, index: index++ }),
                    );
                }

                if (type === 'StmPositionsUpdated') {
                    return createSyncedValueDescriptor(
                        createUpdateEvent<TStmPosition[]>(payload.updated),
                    );
                }

                if (type === 'StmPositionsRemoved') {
                    return createSyncedValueDescriptor(createRemoveEvent(payload.removed));
                }

                assertNever(type);
            },
        );
    },
});
