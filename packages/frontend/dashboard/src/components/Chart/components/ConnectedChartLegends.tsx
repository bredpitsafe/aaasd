import type { Milliseconds } from '@common/types';
import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { useNowMillisecondsForLiveCell } from '@frontend/common/src/components/CustomView/useNowMillisecondsForLiveCell';
import { useLastIndicatorsMap } from '@frontend/common/src/components/hooks/useLastIndicators';
import { useModule } from '@frontend/common/src/di/react';
import type {
    TIndicator,
    TIndicatorsQuery,
} from '@frontend/common/src/modules/actions/indicators/defs';
import type { TIndicatorKey } from '@frontend/common/src/modules/actions/indicators/defs';
import { getIndicatorKey } from '@frontend/common/src/modules/actions/utils.ts';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EMPTY_MAP } from '@frontend/common/src/utils/const';
import { convertIndicatorByScheme } from '@frontend/common/src/utils/CustomView/converters';
import type { TXmlToJsonScheme } from '@frontend/common/src/utils/CustomView/defs';
import { convertFromXmlJsonScheme } from '@frontend/common/src/utils/CustomView/parse';
import { Promql } from '@frontend/common/src/utils/Promql';
import type { TSingleValueSandbox } from '@frontend/common/src/utils/Sandboxes/numberConversion';
import { getNumberConversionSandbox } from '@frontend/common/src/utils/Sandboxes/numberConversion';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import {
    cloneDeep,
    compact,
    isEmpty,
    isNil,
    isNumber,
    isUndefined,
    uniqBy,
    values,
} from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';

import type { TPanelId } from '../../../types/panel';
import type { TChartLegendsView } from '../../ChartLegends/view';
import { ChartLegendsView } from '../../ChartLegends/view';
import { useLegendFontSize } from '../../Settings/hooks/useLegendFontSize';
import { usePanelCollapsedSettings } from '../../Settings/hooks/usePanelCollapsedSettings';
import { usePanelDefaultCollapseSettings } from '../../Settings/hooks/usePanelDefaultCollapseSettings';
import type { TChartProps } from '../types';

type TConnectedChartLegendsView = Omit<
    TChartLegendsView,
    | 'values'
    | 'isCollapsed'
    | 'onToggleCollapse'
    | 'mapChartIdToIndicatorValue'
    | 'getChartIndicatorName'
    | 'fontSize'
> & {
    url: TSocketURL;
    backtestingId?: number;
    panelId: TPanelId;
    schemes?: TXmlToJsonScheme[];
};

export function ConnectedChartLegends(props: TConnectedChartLegendsView): ReactElement {
    const { serverTime$ } = useModule(ModuleCommunication);

    const charts = useMemo(
        () => props.charts.filter(({ legend }) => legend !== false),
        [props.charts],
    );

    const mapChartIdToIndicatorsQuery = useMemo(
        () =>
            charts.reduce(
                (acc, chart) => {
                    const promql = Promql.tryParseQuery(chart.query);

                    const indicatorName = promql?.labels?.name;
                    const queryBtRunId =
                        isNil(promql) || isNil(promql.labels) || isNil(promql.labels.bt_run_no)
                            ? undefined
                            : parseInt(promql.labels.bt_run_no);

                    acc[chart.id] = {
                        url: chart.url ?? props.url,
                        btRuns: !isNil(queryBtRunId)
                            ? [queryBtRunId]
                            : !isNil(props.backtestingId)
                              ? [props.backtestingId]
                              : undefined,
                        names: isEmpty(indicatorName) ? [] : [indicatorName!],
                    };
                    return acc;
                },
                {} as Record<TSeriesId, TIndicatorsQuery>,
            ),
        [charts, props.backtestingId, props.url],
    );

    const mapChartIdToFormula = useMemo(
        () =>
            charts.reduce(
                (acc, chart) => {
                    acc[chart.id] = getNumberConversionSandbox(chart.formula);
                    return acc;
                },
                {} as Record<TSeriesId, undefined | TSingleValueSandbox>,
            ),
        [charts],
    );

    const additionalIndicatorsQuery = useMemo(
        () =>
            compact(charts.map(({ styleIndicator }) => styleIndicator)).map((name) => ({
                url: props.url,
                backtestingId: props.backtestingId,
                names: [name],
            })),
        [charts, props.backtestingId, props.url],
    );

    const allIndicatorsQuery = useMemo(() => {
        const map = uniqBy(
            values(mapChartIdToIndicatorsQuery).concat(additionalIndicatorsQuery),
            getQueryString,
        ).reduce((acc: Map<string, TIndicatorsQuery>, query) => {
            if (isNil(query.names) || query.names.length === 0) {
                return acc;
            }

            const groupKey = getQueryGroup(query);

            const group = acc.get(groupKey);

            if (isNil(group)) {
                acc.set(groupKey, cloneDeep(query));
            } else {
                group.names?.push(...query.names);
            }

            return acc;
        }, new Map<string, TIndicatorsQuery>());

        return Array.from(map.values());
    }, [mapChartIdToIndicatorsQuery, additionalIndicatorsQuery]);

    const currentQueriesHash = useMemo(
        () => getQueriesHash(allIndicatorsQuery),
        [allIndicatorsQuery],
    );
    const cachedQueries = useMemo(
        () => allIndicatorsQuery,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentQueriesHash],
    );

    const mapIndicatorNameToValue: ReadonlyMap<TIndicatorKey, TIndicator> =
        useLastIndicatorsMap(cachedQueries) ?? EMPTY_MAP;

    const mapChartIdToValue = useMemo(
        () =>
            new Map<TSeriesId, TIndicator | undefined>(
                Object.entries(mapChartIdToIndicatorsQuery).map(([id, { names, url, btRuns }]) => {
                    const formula = mapChartIdToFormula[id as TSeriesId];

                    const indicator = mapIndicatorNameToValue.get(
                        getIndicatorKey(url ?? props.url, names![0], btRuns?.[0]),
                    );

                    return [
                        id as TSeriesId,
                        isUndefined(indicator) || isUndefined(formula)
                            ? indicator
                            : {
                                  ...indicator,
                                  value: formula({ value: indicator?.value ?? NaN }),
                              },
                    ];
                }),
            ),
        [mapChartIdToFormula, mapChartIdToIndicatorsQuery, mapIndicatorNameToValue, props.url],
    );

    const chartsWithBackgrounds = useChartsWithBackground(
        charts,
        props.schemes,
        mapChartIdToValue,
        mapIndicatorNameToValue,
        serverTime$,
        props.url,
    );

    const [legendsFontSize] = useLegendFontSize();

    const [isCollapsed] = usePanelCollapsedSettings(props.panelId);
    const [isDefaultCollapsed] = usePanelDefaultCollapseSettings();

    return (
        <ChartLegendsView
            {...props}
            charts={chartsWithBackgrounds}
            mapChartIdToIndicatorValue={mapChartIdToValue}
            isCollapsed={isDefaultCollapsed || isCollapsed}
            fontSize={legendsFontSize}
        />
    );
}

function useChartsWithBackground(
    charts: TChartProps[],
    xmlSchemes: TXmlToJsonScheme[] | undefined,
    mapChartIdToValue: ReadonlyMap<TSeriesId, TIndicator | undefined> | undefined,
    mapIndicatorNameToValue:
        | ReadonlyMap<TIndicator['name'], Record<TSocketURL, TIndicator>>
        | undefined,
    serverTime$: Observable<Milliseconds>,
    url: TSocketURL,
): (TChartProps & { background?: string })[] {
    const backgroundSchemeNames = useMemo(
        () =>
            new Map<string, TSeriesId>(
                charts
                    .filter(({ visible, styleConverter }) => visible && !isEmpty(styleConverter))
                    .map(({ id, styleConverter }) => [styleConverter!, id]),
            ),
        [charts],
    );

    const schemes = useMemo(() => compact(xmlSchemes?.map(convertFromXmlJsonScheme)), [xmlSchemes]);

    const isTimerDependent = useMemo(() => {
        for (const chart of charts) {
            if (isEmpty(chart.styleConverter)) {
                continue;
            }

            const chartStyleScheme = xmlSchemes?.find(({ name }) => name === chart.styleConverter);

            if (isNumber(chartStyleScheme?.timeout) && !isEmpty(chartStyleScheme?.timeoutStyle)) {
                return true;
            }
        }

        return false;
    }, [charts, xmlSchemes]);

    const now = useNowMillisecondsForLiveCell(serverTime$, isTimerDependent);

    const backgroundSchemeConverters = useMemo(() => {
        const map = new Map<string, (value?: TIndicator) => string | undefined>();

        if (isNil(schemes)) {
            return map;
        }

        for (const scheme of schemes) {
            if (isNil(backgroundSchemeNames.get(scheme.name))) {
                continue;
            }

            map.set(scheme.name, (indicator?: TIndicator) => {
                const style = convertIndicatorByScheme(
                    indicator?.value,
                    indicator?.updateTime,
                    now,
                    scheme,
                )?.style;

                return (style?.backgroundColor ?? style?.background) as string | undefined;
            });
        }

        return map;
    }, [schemes, now, backgroundSchemeNames]);

    return useMemo(
        () =>
            charts.map((chart) => {
                if (
                    isEmpty(chart.styleConverter) ||
                    !backgroundSchemeNames.has(chart.styleConverter!)
                ) {
                    return chart;
                }

                const indicator = isEmpty(chart.styleIndicator)
                    ? mapChartIdToValue?.get(chart.id)
                    : mapIndicatorNameToValue?.get(chart.styleIndicator!)?.[chart.url ?? url];

                const background = backgroundSchemeConverters.get(chart.styleConverter!)?.(
                    indicator,
                );

                return {
                    ...chart,
                    background,
                };
            }),
        [
            charts,
            backgroundSchemeNames,
            backgroundSchemeConverters,
            mapChartIdToValue,
            mapIndicatorNameToValue,
            url,
        ],
    );
}

function getQueriesHash(queries: TIndicatorsQuery[]): number | undefined {
    if (isEmpty(queries)) {
        return undefined;
    }

    return shallowHash(...queries.map(getQueryString).sort());
}

function getQueryGroup(query: TIndicatorsQuery): string {
    return `${query.url}:${query.btRuns}`;
}

function getQueryString(query: TIndicatorsQuery): string {
    return `${getQueryGroup(query)}${
        isEmpty(query.names) ? '' : `:${query.names?.sort().join(':')}`
    }`;
}
