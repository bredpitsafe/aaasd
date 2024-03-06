import type { Observable } from 'rxjs';
import { concat, of, timer } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { getHerodotusReferenceCurrencyHandle } from '../../handlers/getHerodotusReferenceCurrencyHandle';
import { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TRobotId } from '../../types/domain/robots';
import type { TSocketURL } from '../../types/domain/sockets';
import { FailFactory, TFail } from '../../types/Fail';
import { dedobs } from '../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../utils/Rx/share';
import { tapError } from '../../utils/Rx/tap';
import { shallowHash } from '../../utils/shallowHash';
import type { TraceId } from '../../utils/traceId';
import { ExtractValueDescriptor, ValueDescriptorFactory } from '../../utils/ValueDescriptor';
import { ModuleCommunicationHandlers } from '../communicationHandlers';
import { ModuleNotifications } from '../notifications/module';
import { DEFAULT_RETRY_DELAY } from './defs';

const createFail = FailFactory('HerodotusReferenceCurrencyFetch');
const descFactory = ValueDescriptorFactory<
    string,
    TFail<'[HerodotusReferenceCurrencyFetch]: UNKNOWN'>
>();

export type THerodotusReferenceCurrencyReturnType = ExtractValueDescriptor<typeof descFactory>;

export const ModuleGetHerodotusReferenceCurrency = ModuleFactory((ctx: TContextRef) => {
    const getHerodotusReferenceCurrency = dedobs(
        (
            url: TSocketURL,
            robotId: TRobotId,
            traceId: TraceId,
        ): Observable<THerodotusReferenceCurrencyReturnType> => {
            const { request } = ModuleCommunicationHandlers(ctx);
            const { error } = ModuleNotifications(ctx);

            return getHerodotusReferenceCurrencyHandle(request, url, robotId, traceId).pipe(
                tapError((err: SocketStreamError) =>
                    error({
                        message: `Error loading robot Reference Currency`,
                        description: err.message,
                        traceId: err.traceId,
                    }),
                ),
                map((envelope) => descFactory.sync(envelope.payload.currency, null)),
                startWith(descFactory.unsc(null)),
                catchError(
                    (error: Error, caught: Observable<THerodotusReferenceCurrencyReturnType>) => {
                        const failResponse = of(descFactory.fail(createFail('UNKNOWN')));

                        if (!(error instanceof SocketStreamError)) {
                            return failResponse;
                        }

                        return concat(
                            failResponse,
                            timer(DEFAULT_RETRY_DELAY).pipe(switchMap(() => caught)),
                        );
                    },
                ),
                shareReplayWithDelayedReset(SHARE_RESET_DELAY),
            );
        },
        {
            normalize: ([url, robotId]) => shallowHash(url, robotId),
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return { getHerodotusReferenceCurrency };
});
