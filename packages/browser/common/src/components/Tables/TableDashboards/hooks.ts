import type { ColDef } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { createTestProps } from '../../../../e2e';
import { EDashboardsTabSelectors } from '../../../../e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import type { TRobotDashboard } from '../../../handlers/def';
import type { TSocketName } from '../../../types/domain/sockets';
import { EDateTimeFormats, ISO, TimeZone } from '../../../types/time';
import { getRobotDashboardURL } from '../../../utils/urlBuilders';
import { dateFormatter } from '../../AgTable/formatters/date';
import { UrlRenderer } from '../../AgTable/renderers/UrlRenderer';
import { EColumnFilterType } from '../../AgTable/types';
import { isoGetter } from '../../AgTable/valueGetters/iso';

export function useDashboardsColumns(
    timeZone: TimeZone,
    socketName: undefined | TSocketName,
    snapshotDate: undefined | ISO,
    onClick?: (url: string, name: string) => void,
): ColDef<TRobotDashboard>[] {
    return useMemo<ColDef<TRobotDashboard>[]>(
        () => [
            {
                field: 'name',
                headerName: 'Dashboard',
                sort: 'asc',
                equals: () => false,
                cellRendererSelector: (params) => {
                    return {
                        params: {
                            url:
                                isNil(params.data) || isNil(socketName)
                                    ? ''
                                    : getRobotDashboardURL({
                                          socket: socketName,
                                          robotId: params.data.robotId,
                                          dashboard: params.data.name,
                                          snapshotDate: snapshotDate,
                                          focusTo: params.data.focusTo,
                                          backtestingId: params.data.backtestingId,
                                          dashboardBacktestingId: params.data.backtestingId,
                                      }),
                            text: params.data?.name,
                            onClick,
                            ...createTestProps(EDashboardsTabSelectors.DashboardLink),
                        },
                        component: UrlRenderer,
                    };
                },
            },
            {
                field: 'robotName',
                headerName: 'Robot name',
                filter: EColumnFilterType.text,
            },
            {
                field: 'platformTime',
                headerName: 'Update time',
                valueGetter: isoGetter(),
                valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTimeMilliseconds),
                filter: EColumnFilterType.date,
            },
        ],
        [onClick, snapshotDate, socketName, timeZone],
    );
}
