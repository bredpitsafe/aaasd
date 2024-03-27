import { getBacktestingTaskConfigsProcedureDescriptor } from '@frontend/common/src/actors/BacktestingDataProviders/procedureDescriptors';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { TBacktestingTaskConfigs } from '@frontend/common/src/types/domain/backtestings';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isUndefined } from 'lodash-es';
import { combineLatest, Observable, of, switchMap } from 'rxjs';

import { ModuleSubscribeToCurrentBacktestingTaskId } from './ModuleSubscribeToCurrentBacktestingTaskId';

const ModuleGetBacktestingTaskConfigs = createRemoteProcedureCall(
    getBacktestingTaskConfigsProcedureDescriptor,
)({
    dedobs: {
        normalize: ([params]) => semanticHash.get(params, {}),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleBacktestingTaskConfigs = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const getBacktestingTaskConfigs = ModuleGetBacktestingTaskConfigs(ctx);
    const subscribeToCurrentBacktestingTaskId = ModuleSubscribeToCurrentBacktestingTaskId(ctx);

    function getCurrentBacktestingTaskConfigs(
        traceId: TraceId,
    ): Observable<TValueDescriptor2<TBacktestingTaskConfigs>> {
        return combineLatest([currentSocketUrl$, subscribeToCurrentBacktestingTaskId()]).pipe(
            switchMap(([target, taskId]) => {
                return isUndefined(target) || isUndefined(taskId)
                    ? of(WAITING_VD)
                    : getBacktestingTaskConfigs({ target, taskId }, { traceId });
            }),
        );
    }

    return {
        getBacktestingTaskConfigs,
        getCurrentBacktestingTaskConfigs,
    };
});
