import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleFetchBuildInfoSnapshotResource } from '@frontend/common/src/handlers/fetchBuildInfoSnapshotHandle';
import { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';

export const ModuleFetchBacktestingRunsBuildInfo = ModuleFactory((ctx: TContextRef) => {
    const fetchBuildInfoSnapshot = ModuleFetchBuildInfoSnapshotResource(ctx);

    return dedobs(
        (url: TSocketURL, runs: TBacktestingRun[], traceId: TraceId) => {
            const btRuns = runs.map((run) => run.btRunNo);
            return fetchBuildInfoSnapshot(url, { filters: { btRuns } }, { traceId });
        },
        {
            removeDelay: DEDUPE_REMOVE_DELAY,
            resetDelay: 0,
            normalize: ([url, runs]) =>
                shallowHash(
                    url,
                    runs
                        ?.map((run) => run.btRunNo)
                        .sort()
                        .join(','),
                    runs
                        ?.map((run) => run.status)
                        .sort()
                        .join(','),
                ),
        },
    );
});
