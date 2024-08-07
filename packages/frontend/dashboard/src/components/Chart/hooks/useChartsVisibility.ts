import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import hash_sum from 'hash-sum';
import pipe from 'lodash/fp/pipe';
import pullAll from 'lodash/fp/pullAll';
import union from 'lodash/fp/union';
import { without } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

import type { TChartPanelChartProps } from '../../../types/panel';
import type { TChartLegendClickModifiers } from '../../ChartLegends/view';

export function useChartsVisibility(charts: TChartPanelChartProps[]) {
    const [hiddenChartIds, setHiddenChartIds] = useState(
        charts.filter((c) => !c.visible).map((c) => c.id),
    );
    const toggleChartVisibility = useFunction(
        (chart: TChartPanelChartProps, modifiers: TChartLegendClickModifiers) => {
            setHiddenChartIds(getHiddenChartsIds(charts, hiddenChartIds, chart, modifiers));
        },
    );

    const mapStateFromProps = useRef(new Map<TSeriesId, boolean>());

    useEffect(() => {
        const showIds: TSeriesId[] = [];
        const hideIds: TSeriesId[] = [];

        for (const chart of charts) {
            if (mapStateFromProps.current.get(chart.id) !== chart.visible) {
                const isVisible = chart.visible === true;
                mapStateFromProps.current.set(chart.id, isVisible);
                (isVisible ? showIds : hideIds).push(chart.id);
            }
        }

        setHiddenChartIds((currentHiddenIds) => {
            return pipe(union(hideIds), pullAll(showIds))(currentHiddenIds) as TSeriesId[];
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash_sum(charts.map((c) => c.visible))]);

    return {
        hiddenChartIds,
        toggleChartVisibility,
    };
}

function getHiddenChartsIds(
    charts: TChartPanelChartProps[],
    hiddenChartsIds: TSeriesId[],
    toggleChart: TChartPanelChartProps,
    modifiers: TChartLegendClickModifiers,
) {
    const { id, group } = toggleChart;
    const isVisible = !hiddenChartsIds.includes(id);
    const isOnlyChartVisible = hiddenChartsIds.length === charts.length - 1;

    // If Ctrl or Meta (for macOS) are pressed, click on an active chart shows all charts,
    // if this is the only active chart. Otherwise, clicked chart becomes the only active one.
    if (modifiers.ctrlKey || modifiers.metaKey) {
        if (isVisible && isOnlyChartVisible) {
            hiddenChartsIds = [];
        } else {
            hiddenChartsIds = charts.filter((chart) => chart.id !== id).map((chart) => chart.id);
        }
    }
    // If Shift key is pressed and clicked chart belongs to a group,
    // Switch all charts with the same group to the state of the clicked chart.
    else if (modifiers.shiftKey) {
        const groupChartIds = charts
            .filter((chart) => chart.group === group)
            .map((chart) => chart.id);
        if (isVisible) {
            // Hide all charts with a given group
            hiddenChartsIds = hiddenChartsIds.concat(groupChartIds);
        } else {
            // Show all charts with a given group
            hiddenChartsIds = without(hiddenChartsIds, ...groupChartIds);
        }
    }
    // If no modifiers are pressed, switch the state of a single chart
    else {
        if (isVisible) {
            hiddenChartsIds = [...hiddenChartsIds, id];
        } else {
            hiddenChartsIds = without(hiddenChartsIds, id);
        }
    }

    return hiddenChartsIds;
}
