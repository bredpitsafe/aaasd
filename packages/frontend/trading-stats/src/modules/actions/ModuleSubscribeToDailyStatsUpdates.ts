import type { TimeZone } from '@common/types';
import type { Assign } from '@common/types/src/utils';
import { toMilliseconds } from '@common/utils';
import type {
    TWithPollInterval,
    TWithServerPollInterval,
    TWithSnapshot,
} from '@frontend/common/src/modules/actions/def.ts';
import {
    convertToSubscriptionEventValueDescriptor,
    pollIntervalForRequest,
    timeZone2UtcOrMskTimeZone,
} from '@frontend/common/src/modules/actions/utils.ts';
import type { TAsset, TAssetId } from '@frontend/common/src/types/domain/asset.ts';
import type { TWithSocketTarget } from '@frontend/common/src/types/domain/sockets.ts';
import type {
    TBalanceStatDaily,
    TDailyStats,
    TDailyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats.ts';
import { EEntityKind } from '@frontend/common/src/types/domain/tradingStats.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

type TSendBody = TWithServerPollInterval &
    Omit<TDailyStatsFilter, 'backtestingId'> & {
        timezone: string;
        btRunNo?: number;
    };

type TReceiveBody = { type: 'TradingStatsDaily' } & TWithSnapshot &
    Assign<
        TDailyStats,
        {
            balanceStats: (TBalanceStatDaily & {
                assetId: TAssetId;
                assetName: TAsset['name'];
            })[];
        }
    >;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToTradingStatsDaily,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToDailyStatsUpdates = createRemoteProcedureCall(descriptor)({
    getParams: (
        params: TWithSocketTarget &
            TWithPollInterval & { timeZone: TimeZone; filters: TDailyStatsFilter },
    ) => {
        return {
            target: params.target,
            date: params.filters.date,
            timezone: timeZone2UtcOrMskTimeZone(params.timeZone),
            exclude: params.filters.exclude,
            include: params.filters.include,
            btRunNo: params.filters.backtestingId,
            pollInterval: pollIntervalForRequest(params?.pollInterval ?? toMilliseconds(1000)),
        };
    },
    getPipe: () =>
        convertToSubscriptionEventValueDescriptor((payload): TDailyStats => {
            return {
                ...payload,
                balanceStats: payload.balanceStats.map(
                    ({
                        assetId,
                        assetName,
                        assetOrInstrumentId,
                        assetOrInstrumentName,
                        entityKind,
                        ...rest
                    }) =>
                        ({
                            ...rest,
                            assetOrInstrumentId: assetOrInstrumentId ?? assetId,
                            assetOrInstrumentName: assetOrInstrumentName ?? assetName,
                            entityKind: entityKind ?? EEntityKind.Asset,
                        }) as TBalanceStatDaily,
                ),
            };
        }),
});
