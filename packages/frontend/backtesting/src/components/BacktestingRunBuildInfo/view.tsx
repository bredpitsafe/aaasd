import { CopyRobotsButton } from '@frontend/common/src/components/CopyRobotsButton';
import { Error } from '@frontend/common/src/components/Error/view';
import { Input } from '@frontend/common/src/components/Input';
import { Space } from '@frontend/common/src/components/Space';
import { TableRunRobotsBuildInfo } from '@frontend/common/src/components/Tables/TableRunRobotsBuildInfo/view';
import type { TabsProps } from '@frontend/common/src/components/Tabs';
import { Tabs } from '@frontend/common/src/components/Tabs';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { cnFit, cnRow } from '@frontend/common/src/utils/css/common.css';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { TBacktestingRunBuildInfoSnapshot } from '../../modules/actions/ModuleFetchBacktestingRunsBuildInfo.ts';
import { cnBuildInfo, cnRoot, cnTable, cnTabs } from './view.css';

type TBacktestingRunBuildInfoProps = TWithClassname & {
    buildInfo: TBacktestingRunBuildInfoSnapshot | undefined;
};
export function BacktestingRunBuildInfo(props: TBacktestingRunBuildInfoProps): ReactElement | null {
    const items: TabsProps['items'] = useMemo(
        () =>
            props.buildInfo?.nodes.map((node) => {
                const key = `Node: ${node.nodeNo}, Launch: ${node.launchNo}`;
                return {
                    key,
                    label: key,
                    children: (
                        <div className={cnRoot}>
                            <Space size="small" className={cn(cnRow, cnBuildInfo)} wrap>
                                <Input
                                    size="small"
                                    addonBefore="Build"
                                    value={node.core?.buildId}
                                />
                                <Input
                                    size="small"
                                    addonBefore="Commit"
                                    value={node.core?.commit}
                                />
                                <Input
                                    size="small"
                                    addonBefore="Version"
                                    value={node.core?.version}
                                />
                            </Space>
                            <div className={cn(cnRow, cnBuildInfo)}>
                                <Space size="small">
                                    Robots
                                    <CopyRobotsButton robots={node.robots} />
                                </Space>
                            </div>
                            <div className={cn(cnRow, cnTable)}>
                                <TableRunRobotsBuildInfo robotsBuildInfo={node.robots} />
                            </div>
                        </div>
                    ),
                };
            }),
        [props.buildInfo],
    );

    return (
        <div className={props.className}>
            {isNil(props.buildInfo) || props.buildInfo.nodes.length === 0 ? (
                <Error status="info" title="Run info not available" />
            ) : (
                <Tabs className={cn(cnFit, cnTabs)} size="small" type="card" items={items} />
            )}
        </div>
    );
}
