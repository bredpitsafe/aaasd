import { isUndefined } from 'lodash-es';
import { Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import { TContextRef } from '../../di';
import { ModuleActor } from '../../modules/actor';
import { ModuleSocketPage } from '../../modules/socketPage';
import { TComponentId } from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { dedobs } from '../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../utils/Rx/share';
import { shallowHash } from '../../utils/shallowHash';
import { TraceId } from '../../utils/traceId';
import { ModuleNotifications } from '../notifications/module';
import { getComponentStateUnbound, TComponentStateDescriptor } from './getComponentStateUnbound';

export type { TComponentStateDescriptor };

type TParams = {
    componentId: TComponentId;
    digest: string;
};

export const getComponentStateDedobs = dedobs(
    (
        ctx: TContextRef,
        params: TParams,
        traceId: TraceId,
    ): Observable<TComponentStateDescriptor> => {
        const actor = ModuleActor(ctx);
        const notifications = ModuleNotifications(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const currentUrl = currentSocketUrl$.pipe(
            filter((maybeUrl): maybeUrl is TSocketURL => !isUndefined(maybeUrl)),
            take(1),
        );

        return currentUrl.pipe(
            switchMap((url) =>
                getComponentStateUnbound({ actor, notifications, url }, params, traceId),
            ),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([, { componentId, digest }]) => shallowHash(componentId, digest),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
