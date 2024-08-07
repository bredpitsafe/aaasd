import { useContextRef } from '@frontend/common/src/di/react';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EDefaultColors, getHexCssColor, string2hex } from '@frontend/common/src/utils/colors';
import { Promql } from '@frontend/common/src/utils/Promql';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TPointStyle } from '@frontend/common/src/utils/Sandboxes/pointStyler.ts';
import { isNumber } from 'lodash-es';
import { useMemo } from 'react';

import type { TChartPanelChartProps } from '../../../types/panel';
import { PartItemsProvider } from '../PartsProvider';

export function usePartsProvider(props: {
    url: TSocketURL;
    charts: TChartPanelChartProps[];
    backtestingId?: number;
}) {
    const getUrl = useFunction((id) => {
        const chart = props.charts.find((p) => p.id === id);
        return chart?.url ?? props.url;
    });
    const getQuery = useFunction((id) => {
        const chart = props.charts.find((p) => p.id === id);
        const queryBtRunId = Promql.parseQuery(chart!.query).labels.bt_run_no;
        const propsBtRunId =
            props.backtestingId === undefined ? undefined : String(props.backtestingId);

        return Promql.upsertQueryLabels(chart!.query, { bt_run_no: queryBtRunId ?? propsBtRunId });
    });
    const getFormula = useFunction((id): undefined | string => {
        const chart = props.charts.find((p) => p.id === id);
        return chart?.formula;
    });
    const getStyle = useFunction((id): TPointStyle => {
        const chart = props.charts.find((p) => p.id === id);
        return {
            color: isNumber(chart?.color)
                ? chart!.color
                : string2hex(getHexCssColor(chart!.color) ?? EDefaultColors.chart),
            opacity: chart?.opacity ?? 1,
            width: chart?.width ?? 1,
        };
    });
    const getStyler = useFunction((id): undefined | string => {
        const chart = props.charts.find((p) => p.id === id);
        return chart?.styler;
    });
    const ctx = useContextRef();

    return useMemo(
        () =>
            new PartItemsProvider(ctx, {
                getUrl,
                getQuery,
                getFormula,
                getStyle,
                getStyler,
            }),
        [ctx, getUrl, getQuery, getFormula, getStyle, getStyler],
    );
}
