import type { ISO } from '@common/types';
import { getNowNanoseconds, iso2nanoseconds, toSomeseconds } from '@common/utils';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import type { TContextRef } from '@frontend/common/src/di';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TSocketName, TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EChartLabelFormats } from '@frontend/common/src/types/panels';
import { getHexCssColorSet } from '@frontend/common/src/utils/colors';
import { Promql } from '@frontend/common/src/utils/Promql';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import type { TDashboard } from '../../../../types/dashboard';
import { CURRENT_DASHBOARD_VERSION } from '../../../../utils/dashboards';
import { DEFAULT_GRID_CELL, grid60x60 } from '../../../../utils/layout';
import { createChartPanel, createChartPanelChartProps } from '../../../../utils/panels';

export function getIndicatorsDashboard(
    ctx: TContextRef,
    socketName: TSocketName,
    indicators: TIndicator['name'][],
    focusTo?: ISO,
): Observable<TDashboard> {
    const { getSocket$ } = ModuleSocketList(ctx);

    const colors = getHexCssColorSet(indicators.length, 75, 40);

    return getSocket$(socketName).pipe(
        first(),
        map((url) => ({
            version: CURRENT_DASHBOARD_VERSION,
            activeLayout: undefined,
            name: indicators.join(', ') as TStorageDashboardName,
            grid: grid60x60,
            panels: [
                createChartPanel({
                    settings: {
                        url: url as TSocketURL,
                        focusTo: toSomeseconds(
                            isNil(focusTo) ? getNowNanoseconds() : iso2nanoseconds(focusTo),
                        ),
                    },
                    charts: indicators.map((indicator, index) =>
                        createChartPanelChartProps(
                            {
                                label: indicator,
                                query: Promql.createQuery('indicators', {
                                    name: indicator,
                                }),
                                color: colors[index],
                                type: EChartType.stairs,
                                labelFormat: EChartLabelFormats.default,
                                opacity: 1,
                                pointSize: 10,
                                striving: true,
                                visible: true,
                            },
                            index,
                        ),
                    ),
                    layouts: [DEFAULT_GRID_CELL],
                }),
            ],
        })),
    );
}
