import { TContextRef } from '@frontend/common/src/di';
import { getComponentStateRevisionUnbound } from '@frontend/common/src/modules/actions/tradingServersManager/getComponentStateRevisionUnbound';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { TComponentId } from '@frontend/common/src/types/domain/component';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { ISO } from '@frontend/common/src/types/time';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { isUndefined } from 'lodash-es';
import { filter, switchMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../../common/src/defs/observables';

type TProps = {
    platformTime: ISO;
    componentId: TComponentId;
};

export const getComponentStateRevisionDedobs = dedobs(
    (ctx: TContextRef, props: TProps, traceId: TraceId) => {
        const actor = ModuleActor(ctx);
        const notifications = ModuleNotifications(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return currentSocketUrl$.pipe(
            filter((maybeUrl): maybeUrl is TSocketURL => !isUndefined(maybeUrl)),
            switchMap((url) => {
                return getComponentStateRevisionUnbound(
                    { actor, notifications, url },
                    props,
                    traceId,
                );
            }),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        normalize: ([, { componentId, platformTime }]) => shallowHash(componentId, platformTime),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
