import { CopyRobotsButton } from '@frontend/common/src/components/CopyRobotsButton';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';

import { useRobots } from '../hooks/robot.ts';
import { useCurrentServer } from '../hooks/servers.ts';

export function WidgetCopyRobots() {
    const server = useCurrentServer();
    const robots = useRobots(server?.value?.robotIds);

    const robotWithBuildInfo = useMemo(
        () => robots?.value?.filter((robot) => !isEmpty(robot.buildInfo)) || EMPTY_ARRAY,
        [robots],
    );

    return <CopyRobotsButton robots={robotWithBuildInfo} />;
}
