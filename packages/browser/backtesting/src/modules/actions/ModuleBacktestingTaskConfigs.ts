import { getBacktestingTaskConfigsProcedureDescriptor } from '@frontend/common/src/actors/BacktestingDataProviders/procedureDescriptors';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import {
    TBacktestingTaskConfigs,
    TBacktestingTaskId,
} from '@frontend/common/src/types/domain/backtestings';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { semanticHash } from '@frontend/common/src/utils/semanticHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { LOADING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isUndefined } from 'lodash-es';
import { filter, Observable, of, switchMap } from 'rxjs';

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
    const _getBacktestingTaskConfigs = ModuleGetBacktestingTaskConfigs(ctx);
    const subscribeToCurrentBacktestingTaskId = ModuleSubscribeToCurrentBacktestingTaskId(ctx);

    function getBacktestingTaskConfigs(
        taskId: TBacktestingTaskId,
        traceId: TraceId,
    ): Observable<TValueDescriptor2<TBacktestingTaskConfigs>> {
        return currentSocketUrl$.pipe(
            filter((maybeUrl): maybeUrl is TSocketURL => !isUndefined(maybeUrl)),
            switchMap((target) => {
                return _getBacktestingTaskConfigs({ target, taskId }, { traceId });
            }),
        );
    }

    function getCurrentBacktestingTaskConfigs(
        traceId: TraceId,
    ): Observable<TValueDescriptor2<TBacktestingTaskConfigs>> {
        return subscribeToCurrentBacktestingTaskId().pipe(
            switchMap((taskId) => {
                return isUndefined(taskId)
                    ? of(LOADING_VD)
                    : getBacktestingTaskConfigs(taskId, traceId);
            }),
        );
    }

    return {
        getBacktestingTaskConfigs,
        getCurrentBacktestingTaskConfigs,
    };
});
