import { EDateTimeFormats } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { useMemo } from 'react';

import { createTestProps } from '../../../../e2e';
import { EDashboardsTabSelectors } from '../../../../e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import type { TIndicator } from '../../../modules/actions/indicators/defs';
import { getIndicatorsDashboardURL } from '../../../utils/urlBuilders';
import { dateFormatter } from '../../AgTable/formatters/date';
import { LoaderRenderer } from '../../AgTable/renderers/LoaderRenderer';
import { UrlRenderer } from '../../AgTable/renderers/UrlRenderer';
import { isoGetter } from '../../AgTable/valueGetters/iso';
import type { TableIndicatorsProps } from './view';

export type TGetIndicatorsColumnsProps = Pick<
    TableIndicatorsProps,
    'socketName' | 'backtestingRunId' | 'onDashboardLinkClick' | 'timeZone'
>;
export function useIndicatorsColumns(props: TGetIndicatorsColumnsProps): ColDef<TIndicator>[] {
    return useMemo(
        () => [
            {
                field: 'publisher',
                sortable: true,
                cellRenderer: LoaderRenderer,
            },
            {
                field: 'name',
                sortable: true,
                cellRendererSelector: (params) => ({
                    params: {
                        url: params.data
                            ? getIndicatorsDashboardURL(
                                  params.data.name,
                                  props.socketName,
                                  params.data.platformTime || undefined,
                                  props.backtestingRunId,
                              )
                            : '',
                        text: params.data?.name,
                        onClick: props.onDashboardLinkClick,
                        ...createTestProps(EDashboardsTabSelectors.DashboardLink),
                    },
                    component: UrlRenderer,
                }),
            },
            {
                field: 'value',
                sortable: true,
            },
            {
                field: 'updateTime',
                valueGetter: isoGetter((data) => data?.updateTime),
                valueFormatter: dateFormatter(
                    props.timeZone,
                    EDateTimeFormats.DateTimeMilliseconds,
                ),
                sortable: true,
            },
        ],
        [props.timeZone, props.socketName, props.backtestingRunId, props.onDashboardLinkClick],
    );
}
