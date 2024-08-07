import type { Nanoseconds } from '@common/types';

import type {
    TFetchHistoryParams,
    TServerFetchHistoryParams,
} from '../../../modules/actions/def.ts';
import type { TBacktestingRun } from '../../../types/domain/backtestings.ts';
import type { TTradeFilterParams } from '../../../types/domain/ownTrades.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

type TServerFetchOwnTradesFilters = {
    btRunNo?: number;
    include?: TTradeFilterParams;
    exclude?: TTradeFilterParams;
};

type TSendBody = {
    params: TServerFetchHistoryParams;
    filters?: TServerFetchOwnTradesFilters;
};

type TReceiveBody = {
    checkedIntervalEnd: Nanoseconds;
    checkedIntervalStart: Nanoseconds;
    ownTrades: [];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchOwnTrades,
    ERemoteProcedureType.Request,
);

export type TFetchOwnTradesParams = TFetchHistoryParams;

export type TFetchOwnTradesFilters = Omit<TServerFetchOwnTradesFilters, 'btRunNo'> & {
    backtestingId?: TBacktestingRun['btRunNo'];
};

export type TFetchOwnTradesProps = TWithSocketTarget & {
    params: TFetchOwnTradesParams;
    filters: TFetchOwnTradesFilters;
};

export const ModuleFetchOwnTrades = createRemoteProcedureCall(descriptor)({
    getParams: (props: TFetchOwnTradesProps) => {
        return {
            target: props.target,
            params: {
                limit: undefined,
                softLimit: props.params.limit,
                direction: props.params.direction,
                platformTime: props.params.timestamp,
                platformTimeExcluded: props.params.timestampExcluded,
                platformTimeBound: props.params.timestampBound,
                platformTimeBoundExcluded: props.params.timestampBoundExcluded,
            },
            filters: {
                btRunNo: props.filters?.backtestingId,
                include: props.filters.include,
                exclude: props.filters.exclude,
            },
        };
    },
    getPipe: () => {
        return mapValueDescriptor(({ value }) =>
            createSyncedValueDescriptor(value.payload.ownTrades),
        );
    },
});
