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
import { requestOwnTradeItemsEnvBox, subscribeToOwnTradeUpdatesEnvBox } from '../../envelope';
import { ownTradesInfinityHistoryBank } from '../ownTradesInfinityHistoryBank';

export function initOwnTradesEffects(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { request, requestStream } = ModuleCommunicationHandlersRemoted(ctx);

    requestOwnTradeItemsEnvBox.response(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = ownTradesInfinityHistoryBank.borrow({
            request,
            requestStream,
            url: payload.url,
            filters: payload.filters,
            timeZone: payload.timeZone,
        });

        loggerInfinityHistory.info('requestOwnTradeItems', {
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
                        loggerInfinityHistory.info('requestOwnTradeItems.response', {
                            traceId,
                            items: convertArrayToLogMessage(items),
                        });
                    },
                    error: (error) => {
                        loggerInfinityHistory.error('requestOwnTradeItems.fail ', {
                            traceId,
                            error,
                        });
                    },
                    finalize: () => {
                        ownTradesInfinityHistoryBank.release(key);
                    },
                }),
            );
    });

    subscribeToOwnTradeUpdatesEnvBox.responseStream(actor, (payload) => {
        const traceId = getTraceId(payload.options);
        const { value, key } = ownTradesInfinityHistoryBank.borrow({
            request,
            requestStream,
            url: payload.url,
            filters: payload.filters,
            timeZone: payload.timeZone,
        });

        loggerInfinityHistory.info('subscribeToOwnTradeUpdates', {
            traceId,
            payload,
        });

        return value.subscribeToUpdates(traceId).pipe(
            extractSyncedValueFromValueDescriptor(),
            tap({
                next: (event) => {
                    loggerInfinityHistory.info(`subscribeToOwnTradeUpdates.${event.type}`, {
                        traceId,
                        items: isSubscriptionEventUpdate(event)
                            ? convertArrayToLogMessage(event.payload)
                            : undefined,
                    });
                },
                error: (error) => {
                    loggerInfinityHistory.error('subscribeToOwnTradeUpdates.fail ', {
                        traceId,
                        error,
                    });
                },
                finalize: () => {
                    ownTradesInfinityHistoryBank.release(key);
                },
            }),
        );
    });
}
