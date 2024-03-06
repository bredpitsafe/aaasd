import type { TContextRef } from '@frontend/common/src/di';
import { getConfigRevision } from '@frontend/common/src/modules/actions/config/getConfigRevision';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import type { Hours } from '@frontend/common/src/types/time';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { hours2milliseconds } from '@frontend/common/src/utils/time';

const DEDUPE_REMOVE_DELAY = hours2milliseconds(1 as Hours);
const SHARE_RESET_DELAY = hours2milliseconds(1 as Hours);

export const getRevision$ = dedobs(
    (ctx: TContextRef, componentId: TComponentId, digest: string) => {
        return getConfigRevision(ctx, componentId, digest).pipe(
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    },
    {
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
