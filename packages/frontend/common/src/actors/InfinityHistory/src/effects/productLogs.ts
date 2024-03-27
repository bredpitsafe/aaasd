import { tap } from 'rxjs/operators';

import { TContextRef } from '../../../../di';
import { EFetchHistoryDirection } from '../../../../handlers/def';
import { getTraceId } from '../../../../handlers/utils';
import { ModuleActor } from '../../../../modules/actor';
import { ModuleCommunicationHandlersRemoted } from '../../../../modules/communicationRemoteHandlers';
import { isSubscriptionEventUpdate } from '../../../../utils/Rx/subscriptionEvents';
import { extractSyncedValueFromValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2';
import { loggerInfinityHistory } from '../../../../utils/Tracing/Children/InfinityHistory';
import { convertArrayToLogMessage } from '../../../../utils/Tracing/utils';
import { requestProductLogItemsEnvBox, subscribeToProductLogUpdatesEnvBox } from '../../envelope';
import { productLogsInfinityHistoryBank } from '../productLogsInfinityHistoryBank';

export function initProductLogsEffects(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);

    requestProductLogItemsEnvBox.response(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = productLogsInfinityHistoryBank.borrow({
            request,
            requestStream,
            url: payload.url,
            filters: payload.filters,
        });

        loggerInfinityHistory.info('requestProductLogItems', {
            traceId,
            payload,
        });

        return value
            .getItems(
                traceId,
                payload.params.direction === EFetchHistoryDirection.Forward
                    ? payload.params.limit
                    : -payload.params.limit,
                payload.params.timestamp,
                payload.params.timestampBound,
            )
            .pipe(
                extractSyncedValueFromValueDescriptor(),
                tap({
                    next: (items) => {
                        loggerInfinityHistory.info('requestProductLogItems.response', {
                            traceId,
                            items: convertArrayToLogMessage(items),
                        });
                    },
                    error: (error) => {
                        loggerInfinityHistory.error('requestProductLogItems.fail', {
                            traceId,
                            error,
                        });
                    },
                    finalize: () => {
                        productLogsInfinityHistoryBank.release(key);
                    },
                }),
            );
    });

    subscribeToProductLogUpdatesEnvBox.responseStream(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = productLogsInfinityHistoryBank.borrow({
            request,
            requestStream,
            url: payload.url,
            filters: payload.filters,
        });

        loggerInfinityHistory.info('subscribeToProductLogUpdates', {
            traceId,
            payload,
        });

        return value.subscribeToUpdates(traceId).pipe(
            extractSyncedValueFromValueDescriptor(),
            tap({
                next: (event) => {
                    loggerInfinityHistory.info(`subscribeToProductLogUpdates.${event.type}`, {
                        traceId,
                        items: isSubscriptionEventUpdate(event)
                            ? convertArrayToLogMessage(event.payload)
                            : undefined,
                    });
                },
                error: (error) => {
                    loggerInfinityHistory.error('subscribeToProductLogUpdates.fail', {
                        traceId,
                        error,
                    });
                },
                finalize: () => {
                    productLogsInfinityHistoryBank.release(key);
                },
            }),
        );
    });
}
