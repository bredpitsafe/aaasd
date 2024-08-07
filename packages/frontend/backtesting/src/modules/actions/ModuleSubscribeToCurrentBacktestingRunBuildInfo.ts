import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type { TBacktestingRun } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { constantNormalizer, dedobs } from '@frontend/common/src/utils/observable/memo';
import {
    distinctValueDescriptorUntilChanged,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import {
    createUnsyncedValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type { TBacktestingRunBuildInfoSnapshot } from './ModuleFetchBacktestingRunsBuildInfo';
import { ModuleFetchBacktestingRunsBuildInfo } from './ModuleFetchBacktestingRunsBuildInfo';
import { ModuleSubscribeToBacktestingRun } from './ModuleSubscribeToBacktestingRun';
import { ModuleSubscribeToRouterParams } from './ModuleSubscribeToRouterParams';

export const ModuleSubscribeToCurrentBacktestingRunBuildInfo = ModuleFactory((ctx) => {
    const subscribeToRouterParams = ModuleSubscribeToRouterParams(ctx);
    const subscribeToBacktestingRun = ModuleSubscribeToBacktestingRun(ctx);
    const fetchBacktestingRunsBuildInfo = ModuleFetchBacktestingRunsBuildInfo(ctx);
    const tryFetchBacktestingRunsBuildInfo = (
        url: TSocketURL,
        run: TBacktestingRun | undefined,
        traceId: TraceId,
    ): Observable<TValueDescriptor2<TBacktestingRunBuildInfoSnapshot[]>> => {
        return isNil(run)
            ? of(
                  createUnsyncedValueDescriptor(
                      Fail(EGrpcErrorCode.NOT_FOUND, {
                          message: 'Run not found',
                      }),
                  ),
              )
            : fetchBacktestingRunsBuildInfo({ target: url, btRuns: [run] }, { traceId });
    };

    return dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<TBacktestingRunBuildInfoSnapshot[]>> =>
            subscribeToRouterParams(['url', 'taskId', 'runId']).pipe(
                switchMap((model) => {
                    const url = model?.url;
                    const taskId = model?.taskId;
                    const runId = model?.runId;

                    return isNil(url) || isNil(taskId) || isNil(runId)
                        ? of(WAITING_VD)
                        : subscribeToBacktestingRun(url, taskId, runId, traceId).pipe(
                              switchMapValueDescriptor(({ value: run }) =>
                                  tryFetchBacktestingRunsBuildInfo(url, run, traceId),
                              ),
                          );
                }),
                distinctValueDescriptorUntilChanged(),
            ),
        {
            normalize: constantNormalizer,
            resetDelay: 0,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );
});
