import type { TraceId } from '@common/utils';
import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import type {
    TIndicator,
    TIndicatorKey,
} from '@frontend/common/src/modules/actions/indicators/defs';
import { ModuleSubscribeToIndicatorsFiniteSnapshot } from '@frontend/common/src/modules/actions/indicators/snapshot';
import { getIndicatorKey } from '@frontend/common/src/modules/actions/utils.ts';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
    squashValueDescriptors,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil, uniq } from 'lodash-es';
import type { Observable } from 'rxjs';
import { EMPTY, shareReplay } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import type { THerodotusTaskInstrumentView } from '../types';
import type { THerodotusTaskInstrument } from '../types/domain';
import { getFullInstrumentName } from '../utils/getItem';
import { isV2HeroProtocolInstrument } from '../utils/isV2HeroProtocol';
import { ModuleHerodotusTasks } from './ModuleHerodotusTasks.ts';

type TInstrumentBestPrice = {
    ask: TIndicator['value'] | undefined;
    askIndicator: TIndicator['name'];
    bid: TIndicator['value'] | undefined;
    bidIndicator: TIndicator['name'];
};

export type TBestInstrumentPrices = ReadonlyMap<
    THerodotusTaskInstrumentView['fullName'],
    TInstrumentBestPrice
>;

function createModule(ctx: TContextRef) {
    const { getActiveTasksList } = ModuleHerodotusTasks(ctx);
    const subscribeToIndicatorsUpdates = ModuleSubscribeToIndicatorsFiniteSnapshot(ctx);

    const subscribeToTasksIndicators = dedobs(
        (
            url: TSocketURL,
            robotId: TRobotId,
            traceId: TraceId,
        ): Observable<TValueDescriptor2<TBestInstrumentPrices>> => {
            const allInstruments$ = getActiveTasksList(robotId, traceId).pipe(
                mapValueDescriptor(({ value: tasks }) => {
                    return createSyncedValueDescriptor(
                        tasks.reduce((acc, task) => {
                            if (!isNil(task.buyInstruments)) {
                                acc.push(...task.buyInstruments);
                            }

                            if (!isNil(task.sellInstruments)) {
                                acc.push(...task.sellInstruments);
                            }
                            return acc;
                        }, [] as THerodotusTaskInstrument[]),
                    );
                }),
                shareReplay({ bufferSize: 1, refCount: true }),
            );

            return allInstruments$.pipe(
                mapValueDescriptor(({ value: instruments }) => {
                    return createSyncedValueDescriptor(
                        uniq(
                            instruments.reduce((acc, inst) => {
                                const ask = getAskIndicatorName(inst);
                                const bid = getBidIndicatorName(inst);
                                acc.push(ask, bid);

                                return acc;
                            }, [] as string[]),
                        ).sort(),
                    );
                }),
                distinctValueDescriptorUntilChanged(),
                switchMapValueDescriptor(({ value: names }) =>
                    isEmpty(names)
                        ? EMPTY
                        : subscribeToIndicatorsUpdates({ url, names }, { traceId }),
                ),
                withLatestFrom(allInstruments$),
                squashValueDescriptors(),
                mapValueDescriptor(({ value: [indicatorsList, allInstruments] }) => {
                    const indicatorsMap = new Map<TIndicatorKey, TIndicator>(
                        indicatorsList.map((ind) => [ind.key, ind] as const),
                    );
                    const instrumentMap = allInstruments.reduce((acc, inst) => {
                        const fullName = getFullInstrumentName(inst);
                        const askName = getAskIndicatorName(inst);
                        const bidName = getBidIndicatorName(inst);
                        acc.set(fullName, {
                            ask: indicatorsMap.get(getIndicatorKey(url!, askName, null))?.value,
                            askIndicator: askName,
                            bid: indicatorsMap.get(getIndicatorKey(url!, bidName, null))?.value,
                            bidIndicator: bidName,
                        });
                        return acc;
                    }, new Map<THerodotusTaskInstrumentView['fullName'], TInstrumentBestPrice>());

                    return createSyncedValueDescriptor(instrumentMap);
                }),
            );
        },
        {
            normalize: ([url, robotId]) => shallowHash(url, robotId),
            resetDelay: 0,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return {
        subscribeToTasksIndicators,
    };
}
export const ModuleHerodotusTaskIndicators = ModuleFactory(createModule);

const getKey = (inst: THerodotusTaskInstrument) =>
    isV2HeroProtocolInstrument(inst) ? inst.instrument : `${inst.name}|${inst.exchange}`;
const getAskIndicatorName = (inst: THerodotusTaskInstrument) => `${getKey(inst)}.l1.ask`;
const getBidIndicatorName = (inst: THerodotusTaskInstrument) => `${getKey(inst)}.l1.bid`;
