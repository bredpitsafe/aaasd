import type {
    TSubscribed,
    TWithPollInterval,
    TWithServerPollInterval,
    TWithSnapshot,
    TWithUpdatesOnly,
} from '../../../../modules/actions/def.ts';
import {
    convertToSubscriptionEventValueDescriptor,
    pollIntervalForRequest,
} from '../../../../modules/actions/utils.ts';
import type { TActiveOrder } from '../../../../types/domain/orders.ts';
import type { TWithSocketTarget } from '../../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../../utils/RPC/defs.ts';
import type { TOrdersSnapshotFilters } from './ModuleFetchOrdersSnapshot.ts';

type TSendBody = Omit<TOrdersSnapshotFilters, 'statuses'> &
    TWithServerPollInterval &
    TWithUpdatesOnly;

type TReceiveBody =
    | TSubscribed
    | (TWithSnapshot & {
          type: 'Orders';
          orders: TActiveOrder[];
      });

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToActiveOrders,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToActiveOrders = createRemoteProcedureCall(descriptor)({
    getParams: (
        params: TWithSocketTarget &
            Omit<TOrdersSnapshotFilters, 'statuses'> &
            TWithPollInterval &
            TWithUpdatesOnly,
    ) => {
        return {
            ...params,
            // if updatesOnly is false, then server will apply special filters. It deprecated behavior
            updatesOnly: params.updatesOnly ?? false,
            pollInterval: pollIntervalForRequest(params.pollInterval),
        };
    },
    getPipe: () => convertToSubscriptionEventValueDescriptor((payload) => payload.orders),
});
