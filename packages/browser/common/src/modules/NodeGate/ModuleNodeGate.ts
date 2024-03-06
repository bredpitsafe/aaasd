import { isUndefined } from 'lodash-es';
import { filter, startWith, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import { ModuleFactory, TContextRef } from '../../di';
import { TSocketURL } from '../../types/domain/sockets';
import { dedobs } from '../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../utils/Rx/share';
import { TraceId } from '../../utils/traceId';
import { UnscDesc } from '../../utils/ValueDescriptor';
import { ModuleActor } from '../actor';
import { ModuleNotifications } from '../notifications/module';
import { ModuleSocketPage } from '../socketPage';
import { getGateKindsUnbound, TGateKindsDescriptor } from './getGateKindsUnbound';

function createModule(ctx: TContextRef) {
    const getGateKinds = dedobs(
        (traceId: TraceId) => {
            const actor = ModuleActor(ctx);
            const notifications = ModuleNotifications(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);

            return currentSocketUrl$.pipe(
                filter((maybeUrl): maybeUrl is TSocketURL => !isUndefined(maybeUrl)),
                switchMap((url) => {
                    return getGateKindsUnbound({ actor, notifications, url }, traceId);
                }),
                startWith(UnscDesc(null) as TGateKindsDescriptor),
                shareReplayWithDelayedReset(SHARE_RESET_DELAY),
            );
        },
        {
            normalize: () => 0,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return {
        getGateKinds,
    };
}

export const ModuleNodeGate = ModuleFactory(createModule);
