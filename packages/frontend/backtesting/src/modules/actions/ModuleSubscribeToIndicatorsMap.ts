import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory } from '@frontend/common/src/di';
import type {
    TIndicator,
    TIndicatorKey,
} from '@frontend/common/src/modules/actions/indicators/defs';
import { ModuleSubscribeToIndicatorsFiniteSnapshot } from '@frontend/common/src/modules/actions/indicators/snapshot';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import {
    extractValueDescriptorFromError,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { keyBy } from 'lodash-es';
import { Observable } from 'rxjs';

export const ModuleSubscribeToIndicatorsMap = ModuleFactory((ctx) => {
    const subscribeToIndicatorsSnapshot = ModuleSubscribeToIndicatorsFiniteSnapshot(ctx);

    return dedobs(
        (
            url: TSocketURL,
            indicatorNames: TIndicator['name'][],
            backtestingRunIds: Array<TBacktestingRunId>,
            traceId: TraceId,
        ): Observable<TValueDescriptor2<Record<TIndicatorKey, TIndicator>>> => {
            return subscribeToIndicatorsSnapshot(
                {
                    url,
                    names: indicatorNames,
                    btRuns: backtestingRunIds,
                },
                { traceId },
            ).pipe(
                mapValueDescriptor(({ value: indicators }) =>
                    createSyncedValueDescriptor(keyBy(indicators, 'key')),
                ),
                extractValueDescriptorFromError(),
                progressiveRetry(),
            );
        },
        {
            removeDelay: DEDUPE_REMOVE_DELAY,
            resetDelay: 0,
            normalize: ([url, names, backtestingRunIds]) =>
                shallowHash(url, names.join(''), ...backtestingRunIds),
        },
    );
});
