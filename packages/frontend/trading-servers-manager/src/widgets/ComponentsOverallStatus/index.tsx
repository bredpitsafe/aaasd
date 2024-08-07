import { green, grey, red, yellow } from '@ant-design/colors';
import { SyncOutlined } from '@ant-design/icons';
import { Badge } from '@frontend/common/src/components/Badge';
import { List } from '@frontend/common/src/components/List';
import { Popover } from '@frontend/common/src/components/Popover';
import { Space } from '@frontend/common/src/components/Space';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EComponentStatus, EComponentType } from '@frontend/common/src/types/domain/component';
import cn from 'classnames';
import { isNil, isNull, isUndefined } from 'lodash-es';
import { memo, useMemo } from 'react';

import { ComponentStatus } from '../../components/Menu/ComponentStatus';
import { useGates } from '../../hooks/gate.ts';
import { useRobots } from '../../hooks/robot.ts';
import { useCurrentServer } from '../../hooks/servers.ts';
import { cnBadgesList, cnBadgesListVertical } from './styles.css';

type TProps = TWithClassname & {
    type?: EComponentType | undefined;
    vertical?: boolean;
};

enum Level {
    Loading = 0,
    Error = 1,
    Disabled = 2,
    Warn = 3,
    Ok = 4,
}
const mapStatusToLevel: Record<EComponentStatus, Level> = {
    [EComponentStatus.Failed]: Level.Error,
    [EComponentStatus.Rejected]: Level.Error,
    [EComponentStatus.Disabled]: Level.Disabled,
    [EComponentStatus.Alarming]: Level.Warn,
    [EComponentStatus.Unknown]: Level.Warn,
    [EComponentStatus.Initializing]: Level.Ok,
    [EComponentStatus.Enabled]: Level.Ok,
    [EComponentStatus.Terminating]: Level.Ok,
};
const mapLevelToFill: Record<Level, string> = {
    [Level.Loading]: grey[6],
    [Level.Ok]: green[6],
    [Level.Warn]: yellow[6],
    [Level.Disabled]: grey[5],
    [Level.Error]: red[6],
};

export const ComponentsOverallStatus = memo(({ className, type, vertical }: TProps) => {
    const statusesDistribution = useStatusesDistribution(type);
    const levelsDistribution = isUndefined(statusesDistribution)
        ? undefined
        : countByLevels(statusesDistribution);
    const data = useMemo(() => {
        const arr = [];
        for (const statusStr in statusesDistribution) {
            const status = statusStr as EComponentStatus;
            const count = statusesDistribution[status];
            if (count === 0) continue;
            arr.push({
                status,
                count,
            });
        }
        return arr;
    }, [statusesDistribution]);
    return (
        <Popover
            className={className}
            placement="rightTop"
            arrowPointAtCenter
            content={
                isUndefined(levelsDistribution) ? (
                    'Loading components statuses...'
                ) : (
                    <List
                        size="small"
                        itemLayout="vertical"
                        split={false}
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item>
                                <Space>
                                    <ComponentStatus status={item.status} />
                                    {`× ${item.count} ${item.status}`}
                                </Space>
                            </List.Item>
                        )}
                    />
                )
            }
        >
            {
                <div className={cn(cnBadgesList, { [cnBadgesListVertical]: vertical })}>
                    {isUndefined(levelsDistribution) ? (
                        <Badge
                            size="small"
                            count={<SyncOutlined color={grey[6]} spin />}
                            title=""
                        />
                    ) : (
                        Object.entries(levelsDistribution).map(([level, count]) =>
                            count === 0 ? null : (
                                <Badge
                                    size="small"
                                    key={level}
                                    count={count}
                                    color={mapLevelToFill[level as unknown as Level]}
                                    title=""
                                />
                            ),
                        )
                    )}
                </div>
            }
        </Popover>
    );
});

function useStatusesDistribution(
    // undefined mean all types
    type?: undefined | EComponentType,
): undefined | Record<EComponentStatus, number> {
    const server = useCurrentServer();
    const robots = useRobots(server.value?.robotIds);
    const mdGates = useGates(server.value?.mdGateIds);
    const execGates = useGates(server.value?.execGateIds);
    const withMdGates =
        type === undefined || (type === EComponentType.mdGate && !isNil(mdGates.value));
    const withExecGates =
        type === undefined || (type === EComponentType.execGate && !isNil(execGates.value));
    const withRobots =
        type === undefined || (type === EComponentType.robot && !isNil(robots.value));

    if (
        isNil(server.value) ||
        (withMdGates ? isNil(mdGates.value) : false) ||
        (withExecGates ? isNil(execGates.value) : false) ||
        (withRobots ? isNil(robots.value) : false)
    ) {
        return;
    }

    const components: Array<Array<{ status: EComponentStatus }>> = [];
    if (withMdGates && !isNil(mdGates.value)) {
        components.push(mdGates.value);
    }
    if (withExecGates && !isNil(execGates.value)) {
        components.push(execGates.value);
    }
    if (withRobots && !isNil(robots.value)) {
        components.push(robots.value);
    }

    return countByStatus(components);
}

function countByStatus(
    listWithStatuses: Array<Array<{ status: EComponentStatus }>>,
): Record<EComponentStatus, number> {
    const result: Record<EComponentStatus, number> = {
        [EComponentStatus.Failed]: 0,
        [EComponentStatus.Rejected]: 0,
        [EComponentStatus.Disabled]: 0,
        [EComponentStatus.Alarming]: 0,
        [EComponentStatus.Unknown]: 0,
        [EComponentStatus.Terminating]: 0,
        [EComponentStatus.Initializing]: 0,
        [EComponentStatus.Enabled]: 0,
    };

    for (const group of listWithStatuses) {
        if (isNull(group)) continue;

        for (const comp of group) {
            result[comp.status] += 1;
        }
    }

    return result;
}

function countByLevels(countedByStatus: Record<EComponentStatus, number>): Record<Level, number> {
    const levels: Record<Level, number> = {
        [Level.Loading]: 0,
        [Level.Error]: 0,
        [Level.Disabled]: 0,
        [Level.Warn]: 0,
        [Level.Ok]: 0,
    };

    for (const status in countedByStatus) {
        const count = countedByStatus[status as EComponentStatus];
        if (count === 0) continue;

        levels[mapStatusToLevel[status as EComponentStatus]] += count;
    }

    return levels;
}
