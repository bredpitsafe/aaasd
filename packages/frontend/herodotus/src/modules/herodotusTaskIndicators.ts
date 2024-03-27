import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { getIndicatorKey } from '@frontend/common/src/handlers/utils';
import { TIndicator, TIndicatorKey } from '@frontend/common/src/modules/actions/indicators/defs';
import { ModuleSubscribeToIndicatorsFiniteSnapshot } from '@frontend/common/src/modules/actions/indicators/snapshot';
import { TRobotId } from '@frontend/common/src/types/domain/robots';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { mapDesc } from '@frontend/common/src/utils/Rx/desc';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TraceId } from '@frontend/common/src/utils/traceId';
import { isEmpty, isNil, uniq } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';

import { THerodotusTaskInstrumentView } from '../types';
import { THerodotusTaskInstrument } from '../types/domain';
import { getFullInstrumentName } from '../utils/getItem';
import { isV2HeroProtocolInstrument } from '../utils/isV2HeroProtocol';
import { ModuleHerodotusTasks } from './herodotusTasks';

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
        ): Observable<TBestInstrumentPrices | undefined> => {
            const allInstruments$ = getActiveTasksList(robotId, traceId).pipe(
                mapDesc({
                    idle: () => undefined,
                    unsynchronized: () => undefined,
                    synchronized: (tasks) => tasks,
                    fail: () => undefined,
                }),
                map((tasks) => {
                    return tasks?.reduce((acc, task) => {
                        if (!isNil(task.buyInstruments)) {
                            acc.push(...task.buyInstruments);
                        }

                        if (!isNil(task.sellInstruments)) {
                            acc.push(...task.sellInstruments);
                        }
                        return acc;
                    }, [] as THerodotusTaskInstrument[]);
                }),
                shareReplay({ bufferSize: 1, refCount: true }),
            );

            return allInstruments$.pipe(
                map((instruments) => {
                    return uniq(
                        instruments?.reduce((acc, inst) => {
                            const ask = getAskIndicatorName(inst);
                            const bid = getBidIndicatorName(inst);
                            acc.push(ask, bid);

                            return acc;
                        }, [] as string[]),
                    ).sort();
                }),
                distinctUntilChanged(),
                switchMap((names) =>
                    isEmpty(names)
                        ? EMPTY
                        : subscribeToIndicatorsUpdates({ url, names }, { traceId }),
                ),
                extractSyncedValueFromValueDescriptor(),
                map(
                    (arr) =>
                        new Map<TIndicatorKey, TIndicator>(
                            arr.map((ind) => [ind.key, ind] as const),
                        ),
                ),
                withLatestFrom(allInstruments$),
                map(([indicatorsMap, allInstruments]) => {
                    return allInstruments?.reduce((acc, inst) => {
                        const fullName = getFullInstrumentName(inst);
                        const askName = getAskIndicatorName(inst);
                        const bidName = getBidIndicatorName(inst);
                        acc.set(fullName, {
                            ask: indicatorsMap?.get(getIndicatorKey(url!, askName, null))?.value,
                            askIndicator: askName,
                            bid: indicatorsMap?.get(getIndicatorKey(url!, bidName, null))?.value,
                            bidIndicator: bidName,
                        });
                        return acc;
                    }, new Map<THerodotusTaskInstrumentView['fullName'], TInstrumentBestPrice>());
                }),
            );
        },
        {
            normalize: ([url, robotId]) => shallowHash(url, robotId),
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
