import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { concat, of, timer } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { getHerodotusPreRiskDataHandle } from '../../handlers/getHerodotusPreRiskDataHandle';
import { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TInstrument, TInstrumentId } from '../../types/domain/instrument';
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

const createFail = FailFactory('HerodotusPreRiskDataFetch');
const descFactory = ValueDescriptorFactory<
    | {
          name: TInstrument['name'];
          maxOrderAmount: number;
          aggression: number;
          aggressionAmount: number;
      }
    | undefined,
    TFail<'[HerodotusPreRiskDataFetch]: UNKNOWN'>
>();

export type THerodotusPreRiskDataReturnType = ExtractValueDescriptor<typeof descFactory>;

export const ModuleGetHerodotusPreRiskData = ModuleFactory((ctx: TContextRef) => {
    const getHerodotusPreRiskData = dedobs(
        (
            url: TSocketURL,
            robotId: TRobotId,
            instrumentId: TInstrumentId,
            traceId: TraceId,
        ): Observable<THerodotusPreRiskDataReturnType> => {
            const { request } = ModuleCommunicationHandlers(ctx);
            const { error } = ModuleNotifications(ctx);

            return getHerodotusPreRiskDataHandle(request, url, robotId, instrumentId, traceId).pipe(
                tapError((err: SocketStreamError) =>
                    error({
                        message: `Error loading robot PreRisk data`,
                        description: err.message,
                        traceId: err.traceId,
                    }),
                ),
                map((envelope) =>
                    isNil(envelope.payload.preRisk)
                        ? descFactory.sync(undefined, null)
                        : descFactory.sync(envelope.payload.preRisk, null),
                ),

                startWith(descFactory.unsc(null)),
                catchError((error: Error, caught: Observable<THerodotusPreRiskDataReturnType>) => {
                    const failResponse = of(descFactory.fail(createFail('UNKNOWN')));

                    if (!(error instanceof SocketStreamError)) {
                        return failResponse;
                    }

                    return concat(
                        failResponse,
                        timer(DEFAULT_RETRY_DELAY).pipe(switchMap(() => caught)),
                    );
                }),
                shareReplayWithDelayedReset(SHARE_RESET_DELAY),
            );
        },
        {
            normalize: ([url, robotId, instrumentId]) => shallowHash(url, robotId, instrumentId),
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return { getHerodotusPreRiskData };
});
