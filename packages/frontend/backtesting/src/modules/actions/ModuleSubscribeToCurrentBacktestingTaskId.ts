import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils';
import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs';

import { EBacktestingSearchParams } from '../../defs/router';
import { ModuleBacktestingRouter } from '../router/module';

export const ModuleSubscribeToCurrentBacktestingTaskId = ModuleFactory((ctx: TContextRef) => {
    const { state$ } = ModuleBacktestingRouter(ctx);

    return dedobs(
        (): Observable<undefined | TBacktestingTask['id']> => {
            return state$.pipe(
                map((v) => extractRouterParam(v.route, EBacktestingSearchParams.BacktestingTaskId)),
                distinctUntilChanged(),
            );
        },
        { removeDelay: DEDUPE_REMOVE_DELAY, resetDelay: 0 },
    );
});
