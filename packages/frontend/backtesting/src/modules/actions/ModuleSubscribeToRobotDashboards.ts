import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TRobotDashboard } from '@frontend/common/src/modules/actions/def.ts';
import { ModuleSubscribeToRobotDashboardsUpdates } from '@frontend/common/src/modules/actions/robotDashboards/ModuleSubscribeToRobotDashboardsUpdates';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import {
    extractValueDescriptorFromError,
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import type { Observable } from 'rxjs';

export const ModuleSubscribeToRobotDashboards = ModuleFactory((ctx) => {
    return dedobs(
        (
            target: TSocketURL,
            runId: TBacktestingRun['btRunNo'],
            robotIds: TRobotId[],
            traceId: TraceId,
        ): Observable<TValueDescriptor2<TRobotDashboard[]>> => {
            const subscribeToRobotDashboards = ModuleSubscribeToRobotDashboardsUpdates(ctx);

            return subscribeToRobotDashboards(
                { target, robotIds, btRunNo: runId },
                { traceId },
            ).pipe(
                scanValueDescriptor(
                    (
                        acc:
                            | undefined
                            | TValueDescriptor2<UnifierWithCompositeHash<TRobotDashboard>>,
                        { value },
                    ) => {
                        const unifier =
                            acc?.value ?? new UnifierWithCompositeHash<TRobotDashboard>('id');
                        return createSyncedValueDescriptor(unifier.modify(value));
                    },
                ),
                mapValueDescriptor((vd) => createSyncedValueDescriptor(vd.value.toArray())),
                extractValueDescriptorFromError(),
                progressiveRetry(),
            );
        },
        {
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
            normalize: ([url, runId, robotIds]) => shallowHash(url, runId, ...robotIds),
        },
    );
});
