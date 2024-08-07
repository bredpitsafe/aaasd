import type { ISO, Nil } from '@common/types';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, of, startWith, switchMap } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../../defs/observables.ts';
import { ModuleFactory } from '../../../di';
import type { TRobotId } from '../../../types/domain/robots.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../../utils/hash/getSocketUrlHash.ts';
import { dedobs } from '../../../utils/observable/memo.ts';
import { semanticHash } from '../../../utils/semanticHash.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import { WAITING_VD } from '../../../utils/ValueDescriptor/utils.ts';
import type { TWithTraceId } from '../def.ts';
import { type TRobotDashboard } from '../def.ts';
import { ModuleListRobotDashboards } from './ModuleListRobotDashboards.ts';
import { ModuleSubscribeToRobotDashboardsUpdates } from './ModuleSubscribeToRobotDashboardsUpdates.ts';

type TSubscribeToRobotDashboardsWithSnapshotParams = {
    robotId: TRobotId;
    platformTime: ISO | undefined;
};
export const ModuleSubscribeToRobotDashboardsWithSnapshot = ModuleFactory((ctx) => {
    const getRobotDashboardSnapshotList = ModuleListRobotDashboards(ctx);
    const subscribeRobotDashboardListUpdates = ModuleSubscribeToRobotDashboardsUpdates(ctx);

    return dedobs(
        (
            target: TSocketURL | Nil,
            params: TSubscribeToRobotDashboardsWithSnapshotParams,
            options: TWithTraceId,
        ): Observable<TValueDescriptor2<TRobotDashboard[]>> => {
            const { platformTime, robotId } = params;

            return of(target).pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    isNil(platformTime)
                        ? subscribeRobotDashboardListUpdates(
                              { robotIds: [robotId], target },
                              options,
                          )
                        : getRobotDashboardSnapshotList(
                              {
                                  target,
                                  robotId,
                                  platformTime,
                              },
                              options,
                          ),
                ),
                startWith(WAITING_VD),
            );
        },
        {
            normalize: ([url, params]) =>
                semanticHash.get(
                    { url, params },
                    { url: semanticHash.withHasher(getSocketUrlHash), params: {} },
                ),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
