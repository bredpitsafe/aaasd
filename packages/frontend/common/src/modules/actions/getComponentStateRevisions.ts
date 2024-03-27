import { isUndefined } from 'lodash-es';
import { filter, startWith, switchMap, take } from 'rxjs/operators';

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
import { UnscDesc } from '../../utils/ValueDescriptor';
import { ModuleNotifications } from '../notifications/module';
import {
    getComponentStateRevisionsUnbound,
    TComponentStateRevisionsDesc,
} from './getComponentStateRevisionsUnbound';

type TProps = {
    componentId: TComponentId;
    btRunNo?: number;
    limit?: number;
};

export const getComponentStateRevisionsDedobs = dedobs(
    (ctx: TContextRef, props: TProps, traceId: TraceId) => {
        const actor = ModuleActor(ctx);
        const notifications = ModuleNotifications(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const currentUrl = currentSocketUrl$.pipe(
            filter((maybeUrl): maybeUrl is TSocketURL => !isUndefined(maybeUrl)),
            take(1),
        );

        return currentUrl.pipe(
            switchMap((url) => {
                return getComponentStateRevisionsUnbound(
                    { actor, notifications, url },
                    props,
                    traceId,
                );
            }),
            startWith(UnscDesc(null) as TComponentStateRevisionsDesc),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([, { componentId, limit, btRunNo }]) =>
            shallowHash(componentId, limit ?? 0, btRunNo ?? 0),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
