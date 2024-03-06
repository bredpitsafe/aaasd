import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import { TContextRef } from '../../di';
import { subscribeComponentConfigUpdatesHandle } from '../../handlers/subscribeComponentConfigUpdatesHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TComponentConfig } from '../../types';
import type { TComponentId } from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { dedobs } from '../../utils/observable/memo';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import { shareReplayWithDelayedReset } from '../../utils/Rx/share';
import { tapError } from '../../utils/Rx/tap';
import { ModuleCommunication } from '../communication';
import { ModuleNotifications } from '../notifications/module';

export const subscribeComponentConfigUpdates$ = dedobs(
    (
        ctx: TContextRef,
        url: TSocketURL,
        componentId: TComponentId,
        lastDigest: string | null,
    ): Observable<TComponentConfig | undefined> => {
        const { requestStream } = ModuleCommunication(ctx);
        const { error } = ModuleNotifications(ctx);

        return subscribeComponentConfigUpdatesHandle(requestStream, url, componentId, lastDigest, {
            timeout: 30_000,
        }).pipe(
            tapError((err: SocketStreamError) => {
                error({
                    message: `Component config subscription failed`,
                    description: err.message,
                    traceId: err.traceId,
                });
            }),
            map(({ payload: { componentId, user, platformTime, config, digest } }) => ({
                componentId,
                updatedBy: {
                    username: user,
                },
                updatedAt: platformTime,
                raw: config || '',
                digest,
            })),
            progressiveRetry(),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    { removeDelay: DEDUPE_REMOVE_DELAY },
);
