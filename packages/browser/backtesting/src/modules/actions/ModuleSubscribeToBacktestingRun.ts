import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type {
    TBacktestingRun,
    TBacktestingTask,
} from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { Observable } from 'rxjs';

import { ModuleSubscribeToBacktestingRuns } from './ModuleSubscribeToBacktestingRuns';

export const ModuleSubscribeToBacktestingRun = ModuleFactory((ctx) => {
    const subscribeToBacktestingRuns = ModuleSubscribeToBacktestingRuns(ctx);

    return dedobs(
        (
            target: TSocketURL,
            taskId: TBacktestingTask['id'],
            runId: TBacktestingRun['btRunNo'],
            traceId: TraceId,
        ): Observable<TValueDescriptor2<undefined | TBacktestingRun>> => {
            return subscribeToBacktestingRuns({ target, taskId }, { traceId }).pipe(
                mapValueDescriptor(({ value: runs }) =>
                    createSyncedValueDescriptor(runs.find((run) => run.btRunNo === runId)),
                ),
            );
        },
        {
            normalize: ([target, taskId, runId]) => shallowHash(target, taskId, runId),
            resetDelay: 0,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
