import type { TFetchHistoryParams, TFetchSnapshotParams } from '../../handlers/def';
import type { TFetchOwnTradesFilters } from '../../handlers/ownTrades/fetchOwnTradesHandle';
import type { TProductLog, TProductLogFilters } from '../../handlers/productLogs/defs';
import type { THandlerOptions } from '../../modules/communicationHandlers/def';
import type { TBacktestingTask } from '../../types/domain/backtestings';
import type { TOwnTrade } from '../../types/domain/ownTrades';
import type { TSocketURL } from '../../types/domain/sockets';
import type { TimeZone } from '../../types/time';
import { createActorObservableBox } from '../../utils/Actors/observable';
import { createActorRequestBox } from '../../utils/Actors/request';
import type { TSubscriptionEvent } from '../../utils/Rx/subscriptionEvents';
import {
    TBacktestingTasksSnapshotFilters,
    TBacktestingTasksSnapshotSortOrder,
} from '../BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';

export const requestProductLogItemsEnvBox = createActorRequestBox<
    {
        url: TSocketURL;
        filters: TProductLogFilters;
        params: TFetchHistoryParams;
        options?: THandlerOptions;
    },
    TProductLog[]
>()(`GET_PRODUCT_LOG_ITEMS`);

export const subscribeToProductLogUpdatesEnvBox = createActorObservableBox<
    { url: TSocketURL; filters: TProductLogFilters; options?: THandlerOptions },
    TSubscriptionEvent<TProductLog[]>
>()(`SUBSCRIBE_TO_PRODUCT_LOG_UPDATES`);

export const requestOwnTradeItemsEnvBox = createActorRequestBox<
    {
        url: TSocketURL;
        filters: TFetchOwnTradesFilters;
        timeZone: TimeZone;
        params: TFetchHistoryParams;
        options?: THandlerOptions;
    },
    TOwnTrade[]
>()(`GET_OWN_TRADE_ITEMS`);

export const subscribeToOwnTradeUpdatesEnvBox = createActorObservableBox<
    {
        url: TSocketURL;
        filters: TFetchOwnTradesFilters;
        timeZone: TimeZone;
        options?: THandlerOptions;
    },
    TSubscriptionEvent<TOwnTrade[]>
>()(`SUBSCRIBE_TO_OWN_TRADE_UPDATES`);

export const requestBacktestingTaskItemsEnvBox = createActorRequestBox<
    {
        url: TSocketURL;
        params: TFetchSnapshotParams & {
            sort: undefined | TBacktestingTasksSnapshotSortOrder;
            filters: undefined | TBacktestingTasksSnapshotFilters;
        };
        options: THandlerOptions;
    },
    TBacktestingTask[]
>()(`GET_BACKTESTING_TASK_ITEMS`);

export const subscribeToBacktestingTaskUpdatesEnvBox = createActorObservableBox<
    {
        url: TSocketURL;
        params: {
            sort: undefined | TBacktestingTasksSnapshotSortOrder;
            filters: undefined | TBacktestingTasksSnapshotFilters;
        };
        options: THandlerOptions;
    },
    TSubscriptionEvent<TBacktestingTask[]>
>()(`SUBSCRIBE_TO_BACKTESTING_TASK_UPDATES`);
