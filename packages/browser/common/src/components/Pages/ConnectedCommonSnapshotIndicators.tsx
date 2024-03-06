import { isEmpty, isEqual, isNil, isUndefined } from 'lodash-es';
import { ReactElement, useCallback, useMemo, useState } from 'react';
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

import { useModule } from '../../di/react';
import type { TFetchSortFieldsOrder } from '../../handlers/def';
import type { TFetchIndicatorsSnapshotFilters } from '../../handlers/Indicators/fetchIndicatorsSnapshotHandle';
import type { TIndicator } from '../../modules/actions/indicators/defs';
import {
    ModuleFetchIndicatorsSnapshot,
    ModuleSubscribeToIndicatorsUpdates,
} from '../../modules/actions/indicators/snapshot';
import { ETableIds } from '../../modules/clientTableFilters/data';
import type { TSocketName, TSocketURL } from '../../types/domain/sockets';
import type { ISO, Milliseconds, TimeZone } from '../../types/time';
import { EMPTY_ARRAY } from '../../utils/const';
import { useFunction } from '../../utils/React/useFunction';
import { extractSyncedValueFromValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import { getNowMilliseconds } from '../../utils/time';
import { generateTraceId } from '../../utils/traceId';
import {
    TInfinityHistoryItemsFetchProps,
    useInfinityHistoryItems,
} from '../AgTable/hooks/useInfinityHistoryItems';
import { useRegExpFilter } from '../Table/helpers/useRegExpFilter';
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
    const fetchIndicatorsSnapshot = useModule(ModuleFetchIndicatorsSnapshot);
    const subscribeToIndicatorsUpdates = useModule(ModuleSubscribeToIndicatorsUpdates);

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
                          ).pipe(extractSyncedValueFromValueDescriptor()),
                      ),
                      tap(onUpdate),
                  )
                : of(EMPTY_ARRAY as TIndicator[]);
        },
        [fetchIndicatorsSnapshot, fieldsOrder$, filters, onUpdate, url],
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
                          ).pipe(extractSyncedValueFromValueDescriptor()),
                      ),
                      tap(onUpdate),
                  )
            : undefined;
    }, [subscribeToIndicatorsUpdates, fieldsOrder$, filters, onUpdate, url]);

    return useInfinityHistoryItems<TIndicator>((v) => v.key, fetch$, subscribe$);
}

function isSubscriptionAvailable(filters: TFetchIndicatorsSnapshotFilters): boolean {
    return isNil(filters.platformTime);
}

function isFilterValid(filters: TFetchIndicatorsSnapshotFilters): boolean {
    return isNil(filters.platformTime) || !isEmpty(filters.names) || !isEmpty(filters.nameRegexes);
}
