import type { TimeZone } from '@common/types';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type {
    TWithPollInterval,
    TWithServerPollInterval,
    TWithSnapshot,
} from '@frontend/common/src/modules/actions/def.ts';
import {
    pollIntervalForRequest,
    timeZone2UtcOrMskTimeZone,
} from '@frontend/common/src/modules/actions/utils.ts';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets.ts';
import type {
    TMonthlyStats,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats.ts';
import { getSocketUrlHash } from '@frontend/common/src/utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { monthlyStatsFilterSemanticHashDescriptor } from './utils.ts';

type TSendBody = TWithServerPollInterval &
    Omit<TMonthlyStatsFilter, 'backtestingId'> & { timezone: string; btRunNo?: number };

type TReceiveBody = TMonthlyStats & TWithSnapshot;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.GetTradingStatsMonth,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToMonthlyStats = createRemoteProcedureCall(descriptor)({
    getParams: (
        params: TWithSocketTarget &
            TWithPollInterval & { timeZone: TimeZone; filters: TMonthlyStatsFilter },
    ) => {
        return {
            target: params.target,
            from: params.filters.from,
            to: params.filters.to,
            timezone: timeZone2UtcOrMskTimeZone(params.timeZone),
            exclude: params.filters.exclude,
            include: params.filters.include,
            btRunNo: params.filters.backtestingId,
            pollInterval: pollIntervalForRequest(params?.pollInterval),
        };
    },
    getPipe: () => {
        return mapValueDescriptor(({ value }) => {
            return createSyncedValueDescriptor(value.payload);
        });
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TMonthlyStatsFilter>((filters) =>
                        semanticHash.get(filters, monthlyStatsFilterSemanticHashDescriptor),
                    ),
                },
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
