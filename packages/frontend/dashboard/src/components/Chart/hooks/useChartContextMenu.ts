import type { Nanoseconds, Someseconds } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { assert } from '@common/utils/src/assert.ts';
import type { TimeseriesCharter } from '@frontend/charter/src';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { saveAsString } from '@frontend/common/src/utils/fileSaver';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isFinite, isUndefined, omit } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';

import type { TChartPanelChartProps, TPanelSettings } from '../../../types/panel';
import type { TDashboardRouteParams } from '../../../types/router';
import { getPanelLabel } from '../../../utils/panels';
import type { TClosestPointData } from '../../ChartPointsPopup/view';
import { createChartContextMenu } from '../../ContextMenus/chart';
import type { TChartContextMenuProps } from '../../ContextMenus/chart/view';
import { SyncViewportPlugin } from '../plugins/SyncViewport';
import type { TMilliseconds2Someseconds, TSomeseconds2Milliseconds } from '../utils';
import { prepareSnapshotToExport } from '../utils';

dayjs.extend(utc);

export function useChartContextMenu(props: {
    charts: TChartPanelChartProps[];
    settings: TPanelSettings;
    onCopyLink: (position: Exclude<TDashboardRouteParams['position'], undefined>) => void;
    onChangeSettings: (settings: TPanelSettings) => void;
    somesecondsToMilliseconds: TSomeseconds2Milliseconds;
    millisecondsToSomeseconds: TMilliseconds2Someseconds;
    getChartClosestPoints: () => TClosestPointData[];

    charter: TimeseriesCharter;
    plugins?: IPlugin[];
}) {
    const messages = useModule(ModuleMessages);

    const { getChartClosestPoints } = props;

    const getContextMenuProps = useFunction(
        ({ closestPoints }: { closestPoints?: TClosestPointData[] }): TChartContextMenuProps => {
            const { charter, settings, onChangeSettings, plugins } = props;
            const syncViewportPlugin = plugins?.find(
                (p): p is SyncViewportPlugin => p instanceof SyncViewportPlugin,
            );

            const mouseOpenTime = props.somesecondsToMilliseconds(
                charter.getPointUnderMouse().x as Someseconds,
            );

            return {
                onCopyTimestamp: () => {
                    const str = dayjs
                        .utc(mouseOpenTime)
                        .format(EDateTimeFormats.DateTimeMilliseconds);

                    clipboardWrite(str).then(() =>
                        messages.success(`Timestamp copied to clipboard`),
                    );
                },

                onCopyLink: props.onCopyLink
                    ? () => {
                          props.onCopyLink({
                              left: charter.getLeft(),
                              right: charter.getRight(),
                              clientTimeIncrement: charter.getClientTimeIncrement(),
                          });
                      }
                    : undefined,

                valuesToCopy: closestPoints
                    ?.filter((p) => isFinite(p.point.y))
                    .map((p) => {
                        const chart = props.charts.find((c) => c.id === p.id);
                        const value = String(p.point.y);
                        assert(!isUndefined(chart));
                        return {
                            label: getPanelLabel(chart, value),
                            key: p.id,
                            color: chart.color,
                            onClick() {
                                clipboardWrite(value).then(() =>
                                    messages.success(`The value has been copied to the clipboard`),
                                );
                            },
                        };
                    }),

                followModes: [...Object.values(EFollowMode)],
                followMode: settings.followMode,
                onSetFollowMode: (mode: EFollowMode) => {
                    onChangeSettings({ ...settings, followMode: mode });
                },

                closestPoints: settings.closestPoints,
                toggleClosestPoints: (closestPoints: boolean) =>
                    onChangeSettings({ ...settings, closestPoints }),

                synced: syncViewportPlugin && syncViewportPlugin.isSyncing(charter),
                onToggleSync:
                    syncViewportPlugin &&
                    ((state: boolean) => {
                        state
                            ? syncViewportPlugin.connect(charter)
                            : syncViewportPlugin.disconnect(charter);
                    }),

                debugState: charter.getDebugState(),
                onToggleDebugState: (state: boolean) => {
                    charter.setDebugState(state);
                },

                displayZeroLeftAxis: settings.displayZeroLeft,
                displayZeroRightAxis: settings.displayZeroRight,
                hasLeftAxis: charter.hasChartsOnAxis(EVirtualViewport.left),
                hasRightAxis: charter.hasChartsOnAxis(EVirtualViewport.right),
                onToggleDisplayZeroLeft: async (state: boolean) => {
                    return onChangeSettings(
                        state
                            ? { ...settings, displayZeroLeft: true }
                            : omit(settings, 'displayZeroLeft'),
                    );
                },
                onToggleDisplayZeroRight: async (state: boolean) => {
                    return onChangeSettings(
                        state
                            ? { ...settings, displayZeroRight: true }
                            : omit(settings, 'displayZeroRight'),
                    );
                },
                currentWorldWidth: charter.getViewport().getWorldScreenWidth(),
                onSetChartWidth: async (chartWidth: Nanoseconds) => {
                    charter.setWorldWidth(chartWidth);
                },

                onUploadState: () => {
                    saveAsString(
                        prepareSnapshotToExport(charter.getSnapshot(), props.charts),
                        'CHART_SNAPSHOT_' + Date.now(),
                        'json',
                    );
                },
            };
        },
    );

    const ref = useRef<HTMLDivElement>(null);
    const contextMenuInterface = useMemo(() => createChartContextMenu(), []);
    const showContextMenu = useFunction((event) => {
        contextMenuInterface.show({
            event,
            props: getContextMenuProps({
                closestPoints: getChartClosestPoints(),
            }),
        });
    });

    useEffect(() => {
        const node = ref.current;
        node?.addEventListener('contextmenu', showContextMenu);
        return () => node?.removeEventListener('contextmenu', showContextMenu);
    }, [showContextMenu]);

    return ref;
}
