import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import {
    getActiveHerodotusTasksEnvBox,
    getArchivedHerodotusTasksEnvBox,
} from '@frontend/common/src/envelops/herodotusTasks';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import {
    extractValueDescriptorFromError,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs';

import type { THerodotusTask } from '../types/domain';

type THerodotusTasksResult = TValueDescriptor2<THerodotusTask[]>;

const OPTIONAL_FIELDS = {
    priceLimit: null,
    priceLimitInQuoteCurrency: null,
    maxPremium: null,
    buyInstruments: null,
    sellInstruments: null,
    finishedTs: null,
};

function createModule(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    const getActiveTasksList = dedobs(
        (robotId: TRobotId, traceId: TraceId): Observable<THerodotusTasksResult> => {
            const resultFromEnvelop = currentSocketUrl$.pipe(
                filter((maybeUrl): maybeUrl is TSocketURL => !isUndefined(maybeUrl)),
                switchMap((url) =>
                    getActiveHerodotusTasksEnvBox
                        .requestStream(actor, {
                            url,
                            params: { robotId },
                            options: { traceId },
                        })
                        .pipe(extractValueDescriptorFromError(), progressiveRetry()),
                ),
            );
            return resultFromEnvelop.pipe(
                mapValueDescriptor(({ value }) =>
                    createSyncedValueDescriptor(
                        value.map((task) => ({
                            ...OPTIONAL_FIELDS,
                            ...task,
                        })),
                    ),
                ),
            );
        },
        {
            normalize: ([robotId]) => robotId,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    const getArchivedTasksList = dedobs(
        (robotId: TRobotId, traceId: TraceId): Observable<THerodotusTasksResult> => {
            const resultFromEnvelop = currentSocketUrl$.pipe(
                filter((maybeUrl): maybeUrl is TSocketURL => !isUndefined(maybeUrl)),
                switchMap((url) => {
                    return getArchivedHerodotusTasksEnvBox
                        .requestStream(actor, {
                            url,
                            params: { robotId },
                            options: { traceId },
                        })
                        .pipe(extractValueDescriptorFromError(), progressiveRetry());
                }),
            );
            return resultFromEnvelop.pipe(
                mapValueDescriptor(({ value }) =>
                    createSyncedValueDescriptor(
                        value.map((task) => ({
                            ...OPTIONAL_FIELDS,
                            ...task,
                        })),
                    ),
                ),
            );
        },
        {
            normalize: ([robotId]) => robotId,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return {
        getActiveTasksList,
        getArchivedTasksList,
    };
}

export const ModuleHerodotusTasks = ModuleFactory(createModule);
