import type { TimeZone } from '@common/types';

import type {
    TWithPollInterval,
    TWithServerPollInterval,
    TWithSnapshot,
    TWithUpdatesOnly,
} from '../../../modules/actions/def.ts';
import {
    convertToSubscriptionEventValueDescriptor,
    pollIntervalForRequest,
    timeZone2UtcOrMskTimeZone,
} from '../../../modules/actions/utils.ts';
import type { TBacktestingRun } from '../../../types/domain/backtestings.ts';
import type { TOwnTrade, TTradeFilterParams } from '../../../types/domain/ownTrades.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';

type TServerSubscribeToOwnTradesFilter = {
    date: string;
    timezone: string;
    include?: TTradeFilterParams;
    exclude?: TTradeFilterParams;
    btRunNo?: number;
};

type TSendBody = TWithServerPollInterval & TWithUpdatesOnly & TServerSubscribeToOwnTradesFilter;

type TReceiveBody = TWithSnapshot & { type: 'OwnTrades'; ownTrades: TOwnTrade[] };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToOwnTrades,
    ERemoteProcedureType.Subscribe,
);

export type TSubscribeToOwnTradesParams = {
    date: string;
    timeZone: TimeZone;
};

export type TSubscribeToOwnTradesFilters = Omit<
    TServerSubscribeToOwnTradesFilter,
    'btRunNo' | 'timezone' | 'date'
> & {
    backtestingId?: TBacktestingRun['btRunNo'];
};

export type TSubscribeToOwnTradesProps = TWithSocketTarget &
    TWithPollInterval &
    TWithUpdatesOnly & {
        params: TSubscribeToOwnTradesParams;
        filters: TSubscribeToOwnTradesFilters;
    };

export const ModuleSubscribeToOwnTrades = createRemoteProcedureCall(descriptor)({
    getParams: (props: TSubscribeToOwnTradesProps) => {
        return {
            target: props.target,
            date: props.params.date,
            timezone: timeZone2UtcOrMskTimeZone(props.params.timeZone),
            exclude: props.filters.exclude,
            include: props.filters.include,
            btRunNo: props.filters.backtestingId,
            updatesOnly: props?.updatesOnly ?? false,
            pollInterval: pollIntervalForRequest(props?.pollInterval),
        };
    },
    getPipe: () => {
        return convertToSubscriptionEventValueDescriptor((payload) => payload.ownTrades);
    },
});
