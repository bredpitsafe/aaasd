import type { Someseconds } from '@common/types';
import { generateTraceId, isISO, iso2nanoseconds, toSomeseconds } from '@common/utils';
import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import type { EChartType } from '@frontend/charter/src/components/Chart/defs';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { Alert } from '@frontend/common/src/components/Alert';
import { asyncHOC } from '@frontend/common/src/components/asyncHOC';
import { ErrorBoundary } from '@frontend/common/src/components/ErrorBoundary';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import type { TDataSourceState } from '@frontend/common/src/modules/dataSourceStatus/defs';
import { ModuleDataSourceStatus } from '@frontend/common/src/modules/dataSourceStatus/module';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils';
import { ModuleSocketServerTime } from '@frontend/common/src/modules/socketServerTime';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TRouterSubscribeState } from '@frontend/common/src/types/router';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { transformDataSourcesStatesToClassName } from '@frontend/common/src/utils/dataSourceStatus';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { cloneDeep } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

import { ModuleUpdatePanel } from '../../../modules/actions/dashboards/updatePanel';
import { ModuleDashboardRouter } from '../../../modules/router/module';
import { ModuleUI } from '../../../modules/ui/module';
import type { TChartPanel, TPanelSettings } from '../../../types/panel';
import type { TDashboardRouteParams, TDashboardRouterData } from '../../../types/router';
import { DEFAULT_SETTINGS } from '../../Chart/def';
import type { TChartProps } from '../../Chart/types';
import { getFirstSecondsToSecondSeconds } from '../../Chart/utils';
import { useShowHorizontalCrosshair } from '../../Settings/hooks/useShowHorizontalCrosshair';
import { useShowPseudoHorizontalCrosshairTooltips } from '../../Settings/hooks/useShowPseudoHorizontalCrosshairTooltips';
import { useChartContextAvailable } from '../hooks/useChartContextAvailable';

const AsyncChart = asyncHOC(() => import('../../Chart').then(({ Chart }) => Chart));

type TConnectedChartProps = TWithClassname & {
    panel: TChartPanel;
    plugins: IPlugin[];
};

type TPanelSettingsWithE2E = TPanelSettings & {
    // Dirty props for E2E TESTs
    // Hidden properties without JSON schema
    doNotInitializeCharts: boolean;
};

export function ConnectedChart({ panel, plugins }: TConnectedChartProps) {
    const { state$, getState, buildUrl } = useModule(ModuleDashboardRouter);
    const { currentChartsTime$ } = useModule(ModuleUI);
    const { success } = useModule(ModuleMessages);
    const { getDataSources$ } = useModule(ModuleDataSourceStatus);
    const { serverTimeMap$ } = useModule(ModuleSocketServerTime);
    const updatePanel = useModule(ModuleUpdatePanel);

    const backtestingId = useSyncObservable(
        useMemo(() => getBacktestingId$(state$), [state$]),
        null,
    );

    const currentTime = useSyncObservable(currentChartsTime$, null);

    const state = useSyncObservable(state$);
    const focusToParam = state ? extractRouterParam(state.route, 'focusTo') : undefined;

    const settings = useMemo(() => {
        if (isISO(focusToParam)) {
            const focusTo = toSomeseconds(iso2nanoseconds(focusToParam));
            const draft = cloneDeep(panel.settings);
            draft.focusTo = focusTo;
            return draft as TPanelSettingsWithE2E;
        }

        return panel.settings as TPanelSettingsWithE2E;
    }, [focusToParam, panel.settings]);

    const charts: TChartProps[] = useMemo(() => {
        return panel.charts.map((chart) => {
            return {
                ...chart,
                id: chart.id,
                type: chart.type as EChartType,
                opacity: chart.opacity !== undefined ? chart.opacity : 1,
                pointSize: chart.pointSize !== undefined ? chart.pointSize : chart.width,
                visible: chart.visible ?? true,
            };
        });
    }, [panel.charts]);

    const [handleChangeSettings] = useNotifiedObservableFunction((settings: TPanelSettings) => {
        return updatePanel(
            {
                ...panel,
                settings,
            },
            { traceId: generateTraceId() },
        );
    });

    const handleCopyLink = useFunction(
        (position: Exclude<TDashboardRouteParams['position'], undefined>) => {
            const {
                route: { name, params },
            } = getState();

            const link = buildUrl(name, {
                ...params,
                focusTo: undefined,
                position,
            });

            clipboardWrite(link).then(() => success(`Link copied to clipboard`));
        },
    );

    const { hasContext, onWebGLContextLost } = useChartContextAvailable();

    const { somesecondsToMilliseconds, millisecondsToSomeseconds } = useMemo(
        () =>
            getFirstSecondsToSecondSeconds(
                settings.serverTimeUnit ?? DEFAULT_SETTINGS.serverTimeUnit,
            ),
        [settings.serverTimeUnit],
    );

    const urls = useMemo(
        () =>
            [settings.url].concat(
                charts.map((c) => c.url).filter((v): v is TSocketURL => v !== undefined),
            ),
        [settings.url, charts],
    );

    const dataSource = useSyncObservable(
        useMemo(() => getDataSources$(urls), [getDataSources$, urls]),
        EMPTY_ARRAY as TDataSourceState[],
    );

    const timeNowIncrements = useSyncObservable(
        useMemo(
            () =>
                serverTimeMap$.pipe(
                    scan(
                        (acc, serverIncrementMap) => {
                            for (const chart of charts) {
                                acc[chart.id] = millisecondsToSomeseconds(
                                    serverIncrementMap[chart.url ?? settings.url] ?? 0,
                                );
                            }

                            return acc;
                        },
                        {} as Record<TSeriesId, Someseconds>,
                    ),
                ),
            [millisecondsToSomeseconds, charts, serverTimeMap$, settings.url],
        ),
        EMPTY_OBJECT,
    );

    const waitPrerequisites =
        currentTime === null || backtestingId === null || settings.doNotInitializeCharts;

    const [timeZoneInfo] = useTimeZoneInfoSettings();
    const [showPseudoHorizontalCrosshair] = useShowHorizontalCrosshair();
    const [showPseudoHorizontalCrosshairTooltips] = useShowPseudoHorizontalCrosshairTooltips();

    const statusClassName = useMemo(
        () => transformDataSourcesStatesToClassName(dataSource),
        [dataSource],
    );

    if (waitPrerequisites) {
        return null;
    }

    if (!hasContext) {
        return (
            <Alert
                message="Warning"
                description="Too many WebGL contexts created, current context is lost. Reload page to view charts."
                type="warning"
                showIcon
                closable={false}
            />
        );
    }

    return (
        <ErrorBoundary>
            <AsyncChart
                className={statusClassName}
                panel={panel}
                settings={settings}
                charts={charts}
                levels={panel.levels}
                schemes={panel.schemes}
                currentTime={currentTime}
                backtestingId={backtestingId}
                timeNowIncrements={timeNowIncrements}
                onChangeSettings={handleChangeSettings}
                onCopyLink={handleCopyLink}
                onWebGLContextLost={onWebGLContextLost}
                somesecondsToMilliseconds={somesecondsToMilliseconds}
                millisecondsToSomeseconds={millisecondsToSomeseconds}
                timeZoneInfo={timeZoneInfo}
                showPseudoHorizontalCrosshair={showPseudoHorizontalCrosshair}
                showPseudoHorizontalCrosshairTooltips={showPseudoHorizontalCrosshairTooltips}
                plugins={plugins}
            >
                Loading canvas...
            </AsyncChart>
        </ErrorBoundary>
    );
}

function getBacktestingId$(state$: Observable<TRouterSubscribeState<TDashboardRouterData>>) {
    return state$.pipe(map((state) => extractRouterParam(state.route, 'backtestingId')));
}
