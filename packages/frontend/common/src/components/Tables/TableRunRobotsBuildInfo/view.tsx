import type { ColDef } from '@frontend/ag-grid';
import type { TBacktestingRunRobotBuildInfo } from '@frontend/backtesting/src/modules/actions/ModuleFetchBacktestingRunsBuildInfo.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { createTestProps } from '../../../../e2e';
import { EDashboardsTabSelectors } from '../../../../e2e/selectors/trading-servers-manager/components/dashboards-tab/dashboards.tab.selectors';
import { ETableIds } from '../../../modules/clientTableFilters/data';
import { getGitlabRepoURL } from '../../../utils/urlBuilders';
import { AgTableWithRouterSync } from '../../AgTable/AgTableWithRouterSync';
import { UrlRenderer } from '../../AgTable/renderers/UrlRenderer';

type TableRunRobotsBuildInfoProps = {
    robotsBuildInfo: TBacktestingRunRobotBuildInfo[] | undefined;
};

const columns: ColDef<TBacktestingRunRobotBuildInfo>[] = [
    { field: 'kind', sort: 'asc' },
    { field: 'buildInfo.version', headerName: 'Version' },
    {
        field: 'buildInfo.commit',
        headerName: 'Commit',
        cellRendererSelector: (params) => ({
            params: {
                url:
                    isNil(params.data) || isNil(params.data.buildInfo)
                        ? null
                        : getGitlabRepoURL(params.data.buildInfo.repoUrlPath, params.value),
                text: params.value,
                ...createTestProps(EDashboardsTabSelectors.DashboardLink),
            },
            component: UrlRenderer,
        }),
    },
    {
        field: 'buildInfo.repoUrlPath',
        headerName: 'Repository',
        cellRendererSelector: (params) => ({
            params: {
                url: getGitlabRepoURL(params.value),
                text: params.value,
                ...createTestProps(EDashboardsTabSelectors.DashboardLink),
            },
            component: UrlRenderer,
        }),
    },
];

export function TableRunRobotsBuildInfo(props: TableRunRobotsBuildInfoProps): ReactElement {
    return (
        <AgTableWithRouterSync
            id={ETableIds.BacktestingRunRobotsBuildInfo}
            rowKey="kind"
            rowData={props.robotsBuildInfo}
            columnDefs={columns}
        />
    );
}
