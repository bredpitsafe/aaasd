import { isEmpty, isNil } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

import type {
    TIndicator,
    TIndicatorKey,
    TIndicatorsQuery,
} from '../../modules/actions/indicators/defs';
import { getIndicatorKey } from '../../modules/actions/utils.ts';
import type { TBacktestingRunId } from '../../types/domain/backtestings';
import type {
    TCompiledGridCell,
    TCustomViewIndicatorKey,
} from '../../utils/CustomView/parsers/defs';
import { useIndicatorsUpdates } from '../hooks/useLastIndicators';
import type { TIndicatorsMap } from './utils';
import { getQueriesFromIndicators } from './utils';

const THROTTLE_INTERVAL = 1000;

export enum EObservableGroupType {
    Grid = 'Grid',
    Table = 'Table',
}

export function useIndicatorsObservablesForGrid(
    backtestingId: undefined | number,
    cells: TCompiledGridCell[],
    indicators: TCustomViewIndicatorKey[],
    allIndicators: TCustomViewIndicatorKey[],
): Map<number | EObservableGroupType, Observable<TIndicatorsMap>> {
    const indicatorsObservableMap = useLastIndicators$(backtestingId, allIndicators);

    return useMemo(() => {
        const indicatorValuesMap = new Map<
            number | EObservableGroupType,
            Observable<TIndicatorsMap>
        >();

        const getCachedIndicatorsValues$ = getCachedIndicatorsValuesBuilder(backtestingId);

        cells.forEach((cell, index) => {
            if (isEmpty(cell.indicators)) {
                return;
            }

            indicatorValuesMap.set(
                index,
                getCachedIndicatorsValues$(cell.indicators, indicatorsObservableMap),
            );
        });

        indicatorValuesMap.set(
            EObservableGroupType.Grid,
            getCachedIndicatorsValues$(indicators, indicatorsObservableMap),
        );

        return indicatorValuesMap;
    }, [backtestingId, cells, indicators, indicatorsObservableMap]);
}

function getCachedIndicatorsValuesBuilder(backtestingId: undefined | TBacktestingRunId) {
    const indicatorValuesMapCache = new Map<string, Observable<TIndicatorsMap>>();

    return function (
        indicators: TCustomViewIndicatorKey[],
        indicatorsObservableMap: ReturnType<typeof useLastIndicators$>,
    ): Observable<TIndicatorsMap> {
        const key = indicators
            .map(({ url, name }) => getIndicatorKey(url, name, backtestingId))
            .sort()
            .join(' - ');

        const cacheItem = indicatorValuesMapCache.get(key);

        if (!isNil(cacheItem)) {
            return cacheItem;
        }

        const indicators$: Observable<TIndicator | undefined>[] = indicators.map(
            ({ url, name }) =>
                indicatorsObservableMap.get(getIndicatorKey(url, name, backtestingId)) ??
                of(undefined),
        );

        const indicatorValues$ = combineLatest(indicators$).pipe(
            map((indicators) =>
                indicators.reduce((acc, indicator) => {
                    if (!isEmpty(indicator)) {
                        acc.set(indicator!.key, indicator!);
                    }
                    return acc;
                }, new Map<TIndicatorKey, TIndicator>()),
            ),
            throttleTime(THROTTLE_INTERVAL, undefined, {
                leading: true,
                trailing: true,
            }),
        );

        indicatorValuesMapCache.set(key, indicatorValues$);

        return indicatorValues$;
    };
}

function useLastIndicators$(
    backtestingId: undefined | number,
    allIndicators: TCustomViewIndicatorKey[],
): ReadonlyMap<TIndicatorKey, Observable<TIndicator | undefined>> {
    const indicatorQueries: TIndicatorsQuery[] = useMemo(
        () =>
            getQueriesFromIndicators(allIndicators).map((query) => ({
                ...query,
                backtestingRunId: backtestingId,
            })),
        [backtestingId, allIndicators],
    );

    const indicators = useIndicatorsUpdates(indicatorQueries);

    const indicatorsObservableMap = useMemo(() => {
        const map = new Map<TIndicatorKey, BehaviorSubject<TIndicator | undefined>>();

        allIndicators.forEach(({ url, name }) =>
            map.set(
                getIndicatorKey(url, name, backtestingId),
                new BehaviorSubject<TIndicator | undefined>(undefined),
            ),
        );

        return map;
    }, [allIndicators, backtestingId]);

    useEffect(
        () =>
            indicators.forEach((indicator) => {
                const subject$ = indicatorsObservableMap.get(indicator.key);

                if (isNil(subject$)) {
                    return;
                }

                const existingIndicator = subject$.getValue();

                if (
                    !isNil(existingIndicator) &&
                    existingIndicator.value === indicator.value &&
                    existingIndicator.updateTime === indicator.updateTime
                ) {
                    return;
                }

                subject$.next(indicator);
            }),
        [indicatorsObservableMap, indicators],
    );

    return indicatorsObservableMap;
}
