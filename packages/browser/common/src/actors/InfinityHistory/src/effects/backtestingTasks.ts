import { tap } from 'rxjs/operators';

import { TContextRef } from '../../../../di';
import { getTraceId } from '../../../../handlers/utils';
import { ModuleActor } from '../../../../modules/actor';
import { isSubscriptionEventUpdate } from '../../../../utils/Rx/subscriptionEvents';
import { extractSyncedValueFromValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2';
import { loggerInfinitySnapshot } from '../../../../utils/Tracing/Children/infinitySnapshot';
import { convertArrayToLogMessage } from '../../../../utils/Tracing/utils';
import {
    requestBacktestingTaskItemsEnvBox,
    subscribeToBacktestingTaskUpdatesEnvBox,
} from '../../envelope';
import { backtestingTasksInfinitySnapshotBank } from '../backtestingTasksInfinitySnapshotBank';

export function initBacktestingTasksEffects(ctx: TContextRef) {
    const actor = ModuleActor(ctx);

    requestBacktestingTaskItemsEnvBox.response(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = backtestingTasksInfinitySnapshotBank.borrow({
            ctx,
            url: payload.url,
            sort: payload.params.sort,
            filters: payload.params.filters,
        });

        loggerInfinitySnapshot.info('requestProductLogItems', {
            traceId,
            payload,
        });

        return value.getItems(traceId, payload.params.offset, payload.params.limit).pipe(
            extractSyncedValueFromValueDescriptor(),
            tap({
                next: (items) => {
                    loggerInfinitySnapshot.info('requestBacktestingTaskItems.response', {
                        traceId,
                        items: convertArrayToLogMessage(items),
                    });
                },
                error: (error) => {
                    loggerInfinitySnapshot.error('requestBacktestingTaskItems.fail', {
                        traceId,
                        error,
                    });
                },
                finalize: () => {
                    backtestingTasksInfinitySnapshotBank.release(key);
                },
            }),
        );
    });

    subscribeToBacktestingTaskUpdatesEnvBox.responseStream(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = backtestingTasksInfinitySnapshotBank.borrow({
            ctx,
            url: payload.url,
            sort: payload.params.sort,
            filters: payload.params.filters,
        });

        loggerInfinitySnapshot.info('subscribeToBacktestingTaskUpdates', {
            traceId,
            payload,
        });

        return value.subscribeToUpdates(traceId).pipe(
            extractSyncedValueFromValueDescriptor(),
            tap({
                next: (event) => {
                    loggerInfinitySnapshot.info(`subscribeToBacktestingTaskUpdates.${event.type}`, {
                        traceId,
                        items: isSubscriptionEventUpdate(event)
                            ? convertArrayToLogMessage(event.payload)
                            : undefined,
                    });
                },
                error: (error) => {
                    loggerInfinitySnapshot.error('subscribeToBacktestingTaskUpdates.fail', {
                        traceId,
                        error,
                    });
                },
                finalize: () => {
                    backtestingTasksInfinitySnapshotBank.release(key);
                },
            }),
        );
    });
}
