import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import {
    getActiveHerodotusTasksEnvBox,
    getArchivedHerodotusTasksEnvBox,
} from '@frontend/common/src/envelops/herodotusTasks';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { TRobotId } from '@frontend/common/src/types/domain/robots';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { TActorObservableBoxResult } from '@frontend/common/src/utils/Actors/observable/def';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { mapDesc } from '@frontend/common/src/utils/Rx/desc';
import { progressiveRetry } from '@frontend/common/src/utils/Rx/progressiveRetry';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { TraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    UnscDesc,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { isUndefined } from 'lodash-es';
import { filter, Observable, startWith, switchMap } from 'rxjs';

import { THerodotusTask } from '../types/domain';

type TActiveTasksEnvelopeResult = TActorObservableBoxResult<typeof getActiveHerodotusTasksEnvBox>;
type TArchivedTasksEnvelopeResult = TActorObservableBoxResult<
    typeof getArchivedHerodotusTasksEnvBox
>;
const ModuleHerodotusTasksFail = FailFactory('ModuleHerodotusTasks');
const UNKNOWN_FAIL = ModuleHerodotusTasksFail('UNKNOWN');
const HerodotusTasks = ValueDescriptorFactory<THerodotusTask[], typeof UNKNOWN_FAIL>();
type THerodotusTasksResult = ExtractValueDescriptor<typeof HerodotusTasks>;

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
    const notifications = ModuleNotifications(ctx);

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
                        .pipe(
                            tapError((error) => {
                                notifications.error({
                                    traceId,
                                    message: 'Failed to receive herodotus tasks',
                                    description: error.message,
                                });
                            }),
                            progressiveRetry(),
                            startWith(UnscDesc(null) as TActiveTasksEnvelopeResult),
                        ),
                ),
            );
            return resultFromEnvelop.pipe(
                mapDesc({
                    idle: () => HerodotusTasks.unsc(null),
                    unsynchronized: () => HerodotusTasks.unsc(null),
                    synchronized: (tasks) =>
                        HerodotusTasks.sync(
                            tasks.map((task) => ({
                                ...OPTIONAL_FIELDS,
                                ...task,
                            })),
                            null,
                        ),
                    fail: () => HerodotusTasks.fail(UNKNOWN_FAIL),
                }),
                startWith(HerodotusTasks.unsc(null)),
                shareReplayWithDelayedReset(SHARE_RESET_DELAY),
            );
        },
        {
            normalize: ([robotId]) => robotId,
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
                        .pipe(
                            tapError((error) => {
                                notifications.error({
                                    traceId,
                                    message: 'Failed to receive herodotus tasks',
                                    description: error.message,
                                });
                            }),
                            progressiveRetry(),
                            startWith(UnscDesc(null) as TArchivedTasksEnvelopeResult),
                        );
                }),
            );
            return resultFromEnvelop.pipe(
                mapDesc({
                    idle: () => HerodotusTasks.unsc(null),
                    unsynchronized: () => HerodotusTasks.unsc(null),
                    synchronized: (tasks) =>
                        HerodotusTasks.sync(
                            tasks.map((task) => ({
                                ...OPTIONAL_FIELDS,
                                ...task,
                            })),
                            null,
                        ),
                    fail: () => HerodotusTasks.fail(UNKNOWN_FAIL),
                }),
                startWith(HerodotusTasks.unsc(null)),
                shareReplayWithDelayedReset(SHARE_RESET_DELAY),
            );
        },
        {
            normalize: ([robotId]) => robotId,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return {
        getActiveTasksList,
        getArchivedTasksList,
    };
}

export const ModuleHerodotusTasks = ModuleFactory(createModule);
