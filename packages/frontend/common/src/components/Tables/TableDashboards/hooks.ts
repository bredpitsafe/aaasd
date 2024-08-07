import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type { ColDef, ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { createTestProps } from '../../../../e2e';
import { EDashboardsTabSelectors } from '../../../../e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import type { TRobotDashboard } from '../../../modules/actions/def.ts';
import type { TSocketName } from '../../../types/domain/sockets';
import { getRobotDashboardURL } from '../../../utils/urlBuilders';
import { dateFormatter } from '../../AgTable/formatters/date';
import { UrlRenderer } from '../../AgTable/renderers/UrlRenderer';
import { isoGetter } from '../../AgTable/valueGetters/iso';

export function useDashboardsColumns(
    timeZone: TimeZone,
    socketName: undefined | TSocketName,
    snapshotDate: undefined | ISO,
    onClick?: (url: string, name: string) => void,
): ColDef<TRobotDashboard>[] {
    const dashboardValueGetter = ({ data }: ValueGetterParams<TRobotDashboard>) => {
        return data && AgValue.create(data.name, data, ['robotId', 'focusTo', 'backtestingId']);
    };

    return useMemo<ColDef<TRobotDashboard>[]>(
        () => [
            {
                colId: 'dashboard',
                headerName: 'Dashboard',
                sort: 'asc',
                equals: AgValue.isEqual,
                valueGetter: dashboardValueGetter,
                cellRendererSelector: (
                    params: ICellRendererParams<
                        ReturnType<typeof dashboardValueGetter>,
                        TRobotDashboard
                    >,
                ) => {
                    const name = params.value?.payload;
                    const data = params.value?.data;
                    return {
                        params: {
                            url:
                                isNil(name) || isNil(data) || isNil(socketName)
                                    ? ''
                                    : getRobotDashboardURL({
                                          socket: socketName,
                                          robotId: data.robotId,
                                          dashboard: name,
                                          snapshotDate: snapshotDate,
                                          focusTo: data.focusTo,
                                          backtestingId: data.backtestingId,
                                          dashboardBacktestingId: data.backtestingId,
                                      }),
                            text: name,
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
