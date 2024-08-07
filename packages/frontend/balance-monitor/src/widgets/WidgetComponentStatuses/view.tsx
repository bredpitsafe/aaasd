import {
    BalanceMonitorProps,
    EBalanceMonitorSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/balance-monitor.page.selectors';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TComponentStatusInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EComponentStatus } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import { memo } from 'react';

import { ComponentStatusBadge } from './ComponentStatusBadge';
import { cnBadgesList, cnBadgesListContainer } from './view.css';

export const ComponentStatuses = memo(
    ({
        className,
        collapsed,
        groups,
        toggleComponentStatuses,
    }: TWithClassname & {
        collapsed: boolean;
        groups: Partial<Record<EComponentStatus, TComponentStatusInfo[]>>;
        toggleComponentStatuses: VoidFunction;
    }) => (
        <div className={cn(className, cnBadgesListContainer)} onClick={toggleComponentStatuses}>
            <div
                {...BalanceMonitorProps[EBalanceMonitorSelectors.ComponentStatusesButton]}
                className={cnBadgesList}
            >
                <ComponentStatusBadge
                    collapsed={collapsed}
                    groups={groups}
                    status={EComponentStatus.Starting}
                />
                <ComponentStatusBadge
                    collapsed={collapsed}
                    groups={groups}
                    status={EComponentStatus.Started}
                />
                <ComponentStatusBadge
                    collapsed={collapsed}
                    groups={groups}
                    status={EComponentStatus.Failed}
                />
                <ComponentStatusBadge
                    collapsed={collapsed}
                    groups={groups}
                    status={EComponentStatus.Alarm}
                />
                <ComponentStatusBadge
                    collapsed={collapsed}
                    groups={groups}
                    status={EComponentStatus.Stopped}
                />
            </div>
        </div>
    ),
);
