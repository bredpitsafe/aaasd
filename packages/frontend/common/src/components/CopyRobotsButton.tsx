import { SaveOutlined } from '@ant-design/icons';
import type { TBacktestingRunRobotBuildInfo } from '@frontend/backtesting/src/modules/actions/ModuleFetchBacktestingRunsBuildInfo.ts';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/modules/messages';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { getGitlabRobotRepoURL } from '@frontend/common/src/utils/urlBuilders';
import { Button } from 'antd';
import { isEmpty, isNil, uniq } from 'lodash-es';
import { useMemo } from 'react';

import {
    BacktestingProps,
    EBacktestingSelectors,
} from '../../e2e/selectors/backtesting/backtesting.page.selectors';
import type { TRobot, TRobotWithNotNilBuildInfo } from '../types/domain/robots';
import { cnButton } from './CopyRobotsButton.css';

export function CopyRobotsButton({
    robots,
}: {
    robots: TBacktestingRunRobotBuildInfo[] | TRobot[];
}) {
    const { success } = useModule(ModuleMessages);

    const disabled = isEmpty(robots);

    const uniqueLinks = useMemo(() => {
        const robotsWithBuildInfo = robots.filter(
            isRobotWithBuildInfo,
        ) as TRobotWithNotNilBuildInfo[];
        return uniq(
            robotsWithBuildInfo.map((robot) => {
                return getGitlabRobotRepoURL(robot.buildInfo.repoUrlPath, robot.buildInfo.version)
                    .href;
            }),
        );
    }, [robots]);

    const cbButtonClick = useFunction(async (event) => {
        event.stopPropagation();

        const str = uniqueLinks.join(';\n');
        await clipboardWrite(str);
        success(`${uniqueLinks.length} robots repos copied to clipboard`);
    });

    return (
        <Button
            {...BacktestingProps[EBacktestingSelectors.CopyRobotsButton]}
            icon={<SaveOutlined />}
            title="Copy robots repos"
            disabled={disabled}
            onClick={cbButtonClick}
            size="small"
            className={cnButton}
        />
    );
}

function isRobotWithBuildInfo(
    robot: TBacktestingRunRobotBuildInfo | TRobot,
): robot is TRobotWithNotNilBuildInfo {
    return 'buildInfo' in robot && !isNil(robot.buildInfo);
}
