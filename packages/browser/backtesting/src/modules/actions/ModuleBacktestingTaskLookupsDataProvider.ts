import {
    TBacktestingTasksSnapshotFilters,
    TBacktestingTasksSnapshotSortOrder,
} from '@frontend/common/src/actors/BacktestingDataProviders/actions/ModuleFetchBacktestingTasksSnapshot';
import {
    requestBacktestingTaskItemsEnvBox,
    subscribeToBacktestingTaskUpdatesEnvBox,
} from '@frontend/common/src/actors/InfinityHistory/envelope';
import { ModuleFactory } from '@frontend/common/src/di';
import { TFetchSnapshotParams } from '@frontend/common/src/handlers/def';
import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { THandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import { shareReplayWithImmediateReset } from '@frontend/common/src/utils/Rx/share';
import { TSubscriptionEvent } from '@frontend/common/src/utils/Rx/subscriptionEvents';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { Observable } from 'rxjs';

export const ModuleBacktestingTaskLookupsDataProvider = ModuleFactory((ctx) => {
    const actor = ModuleActor(ctx);
    const { error } = ModuleNotifications(ctx);

    // DON'T USE DEDOBS, data depends on time
    const fetch = (
        url: TSocketURL,
        params: TFetchSnapshotParams & {
            sort: undefined | TBacktestingTasksSnapshotSortOrder;
            filters: undefined | TBacktestingTasksSnapshotFilters;
        },
        options: THandlerOptions,
    ) => {
        return requestBacktestingTaskItemsEnvBox
            .request(actor, {
                url,
                params,
                options,
            })
            .pipe(
                tapError((err: SocketStreamError) => {
                    error({
                        message: `Backtesting tasks request failed`,
                        description: err.message,
                        traceId: err.traceId,
                    });
                }),
                progressiveRetry(),
            );
    };

    const subscribe = (
        url: TSocketURL,
        params: {
            sort: undefined | TBacktestingTasksSnapshotSortOrder;
            filters: undefined | TBacktestingTasksSnapshotFilters;
        },
        options: THandlerOptions,
    ): Observable<TSubscriptionEvent<TBacktestingTask[]>> => {
        return subscribeToBacktestingTaskUpdatesEnvBox
            .requestStream(actor, {
                url,
                params,
                options,
            })
            .pipe(
                tapError((err: SocketStreamError) => {
                    error({
                        message: `Backtesting tasks subscription failed`,
                        description: err.message,
                        traceId: err.traceId,
                    });
                }),
                progressiveRetry(),
                shareReplayWithImmediateReset(),
            );
    };

    return { fetch, subscribe };
});
