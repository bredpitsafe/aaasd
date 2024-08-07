import type { ISO, Milliseconds, TimeZone } from '@common/types';
import { generateTraceId, getNowMilliseconds } from '@common/utils';
import { isEmpty, isEqual, isNil, isUndefined } from 'lodash-es';
import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
    BehaviorSubject,
    concatMapTo,
    distinctUntilChanged,
    exhaustMap,
    of,
    switchMap,
    timer,
} from 'rxjs';
import { tap } from 'rxjs/operators';

import type { TFetchIndicatorsSnapshotFilters } from '../../actors/IndicatorsDataProvider/actions/ModuleFetchIndicatorsSnapshot.ts';
import { useModule } from '../../di/react';
import type { TFetchSortFieldsOrder } from '../../modules/actions/def.ts';
import type { TIndicator } from '../../modules/actions/indicators/defs';
import {
    ModuleFetchIndicatorsInfinitySnapshot,
    ModuleSubscribeToIndicatorsInfinitySnapshot,
} from '../../modules/actions/indicators/snapshot';
import { ETableIds } from '../../modules/clientTableFilters/data';
import type { TSocketName, TSocketURL } from '../../types/domain/sockets';
import { EMPTY_ARRAY } from '../../utils/const';
import { useFunction } from '../../utils/React/useFunction';
import { ModuleNotifyErrorAndFail } from '../../utils/Rx/ModuleNotify.ts';
import { extractSyncedValueFromValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import type { TInfinityHistoryItemsFetchProps } from '../AgTable/hooks/useInfinityHistoryItems';
import { useInfinityHistoryItems } from '../AgTable/hooks/useInfinityHistoryItems';
import { useRegExpFilter } from '../AgTable/hooks/useRegExpFilter.tsx';
import {
    timePreset2Iso,
    useConnectedMinUpdateTimePresets,
} from '../Tables/TableAllIndicators/hooks/useConnectedMinUpdateTimePresets';
import { TableIndicators } from '../Tables/TableAllIndicators/view';

type TConnectedCommonSnapshotIndicatorsProps = {
    socketUrl: TSocketURL;
    socketName: TSocketName;
    backtestingRunId?: number;

    onDashboardLinkClick: (url: string, name: string) => void;
    date: ISO | undefined;
    onChangeDate: (date: ISO | undefined) => unknown;

    timeZone: TimeZone;
};
export function ConnectedCommonSnapshotIndicators(
    props: TConnectedCommonSnapshotIndicatorsProps,
): ReactElement {
    const [updateTime, setUpdateTime] = useState<Milliseconds | undefined>(undefined);
    const setLastTime = useFunction(() => setUpdateTime(getNowMilliseconds()));

    const { minUpdateTimePresets, minUpdateTimePreset, onMinUpdateTimePresetChange } =
        useConnectedMinUpdateTimePresets(ETableIds.AllIndicators);

    const { serverRegex, editableRegex, caseSensitive, changeRegExp, toggleCaseSensitive } =
        useRegExpFilter(ETableIds.AllIndicators);

    const filters = useMemo(
        (): TFetchIndicatorsSnapshotFilters => ({
            btRuns: isNil(props.backtestingRunId) ? undefined : [props.backtestingRunId],
            nameRegexes: isNil(serverRegex) ? undefined : [serverRegex],
            platformTime: props.date,
            minUpdateTime: isUndefined(minUpdateTimePreset)
                ? undefined
                : timePreset2Iso(minUpdateTimePreset),
        }),
        [minUpdateTimePreset, props.backtestingRunId, props.date, serverRegex],
    );

    const infinitySnapshotIndicators = useInfinitySnapshotIndicators(
        props.socketUrl,
        filters,
        setLastTime,
    );

    return (
        <TableIndicators
            infinityHistoryItems={infinitySnapshotIndicators}
            updateTime={updateTime}
            backtestingRunId={props.backtestingRunId}
            socketName={props.socketName}
            exportFilename={`All_indicators__[socket ${props.socketName}]`}
            onDashboardLinkClick={props.onDashboardLinkClick}
            regExp={editableRegex}
            onRegExpChange={changeRegExp}
            caseSensitive={caseSensitive}
            onToggleCaseSensitive={toggleCaseSensitive}
            date={props.date}
            onChangeDate={props.onChangeDate}
            timeZone={props.timeZone}
            minUpdateTimePreset={minUpdateTimePreset}
            minUpdateTimePresets={minUpdateTimePresets}
            onMinUpdateTimePresetChange={onMinUpdateTimePresetChange}
        />
    );
}

export function useInfinitySnapshotIndicators(
    url: TSocketURL,
    filters: TFetchIndicatorsSnapshotFilters,
    onUpdate: () => unknown,
) {
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);
    const fetchIndicatorsSnapshot = useModule(ModuleFetchIndicatorsInfinitySnapshot);
    const subscribeToIndicatorsUpdates = useModule(ModuleSubscribeToIndicatorsInfinitySnapshot);

    const fieldsOrder$ = useMemo(
        () => new BehaviorSubject<undefined | TFetchSortFieldsOrder<TIndicator>>(undefined),
        [],
    );

    const fetch$ = useCallback(
        (params: TInfinityHistoryItemsFetchProps<TIndicator>) => {
            fieldsOrder$.next(params.sort);

            return isFilterValid(filters)
                ? timer(300).pipe(
                      exhaustMap(() =>
                          fetchIndicatorsSnapshot(
                              {
                                  url,
                                  params: {
                                      offset: params.offset,
                                      limit: params.limit,
                                  },
                                  sort: { fieldsOrder: params.sort },
                                  filters,
                              },
                              { traceId: generateTraceId() },
                          ).pipe(notifyErrorAndFail(), extractSyncedValueFromValueDescriptor()),
                      ),
                      tap(onUpdate),
                  )
                : of(EMPTY_ARRAY as TIndicator[]);
        },
        [fetchIndicatorsSnapshot, fieldsOrder$, filters, notifyErrorAndFail, onUpdate, url],
    );
    const subscribe$ = useMemo(() => {
        return isSubscriptionAvailable(filters)
            ? () =>
                  timer(300).pipe(
                      concatMapTo(fieldsOrder$),
                      distinctUntilChanged(isEqual),
                      switchMap((fieldsOrder) =>
                          subscribeToIndicatorsUpdates(
                              { url, sort: { fieldsOrder }, filters },
                              { traceId: generateTraceId() },
                          ).pipe(notifyErrorAndFail(), extractSyncedValueFromValueDescriptor()),
                      ),
                      tap(onUpdate),
                  )
            : undefined;
    }, [filters, fieldsOrder$, onUpdate, subscribeToIndicatorsUpdates, url, notifyErrorAndFail]);

    return useInfinityHistoryItems<TIndicator>((v) => v.key, fetch$, subscribe$);
}

function isSubscriptionAvailable(filters: TFetchIndicatorsSnapshotFilters): boolean {
    return isNil(filters.platformTime);
}

function isFilterValid(filters: TFetchIndicatorsSnapshotFilters): boolean {
    return isNil(filters.platformTime) || !isEmpty(filters.names) || !isEmpty(filters.nameRegexes);
}
