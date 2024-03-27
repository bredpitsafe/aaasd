import { BaseTimeContext } from '@frontend/common/src/components/BaseTimeContext';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EOrderStatus } from '@frontend/common/src/types/domain/orders';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { Milliseconds } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { getNowMilliseconds } from '@frontend/common/src/utils/time';
import cn from 'classnames';
import { ReactElement, useMemo, useState } from 'react';

import { TableActiveOrders } from '../../../Tables/TableActiveOrders';
import { cnContainer, cnTable } from './ConnectedTableActiveOrders.css';
import { useInfinitySnapshotOrders } from './useInfinitySnapshotOrders';

export function ConnectedTableActiveOrders({
    className,
    robot,
}: TWithClassname & {
    robot: TRobot;
}): ReactElement | null {
    const { serverTime$ } = useModule(ModuleCommunication);
    const { currentSocketUrl$ } = useModule(ModuleSocketPage);

    const [updateTime, setUpdateTime] = useState<Milliseconds | undefined>(undefined);
    const setLastTime = useFunction(() => setUpdateTime(getNowMilliseconds()));

    const url = useSyncObservable(currentSocketUrl$)!;

    const filters = useMemo(() => {
        return {
            robotIds: [robot.id],
            statuses: [
                EOrderStatus.Placing,
                EOrderStatus.Placed,
                EOrderStatus.Canceling,
                EOrderStatus.Moving,
            ],
        };
    }, [robot.id]);
    const time = useSyncObservable(serverTime$, 0 as Milliseconds);

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    const { getItems$, updateTrigger$ } = useInfinitySnapshotOrders(url, filters, setLastTime);

    return (
        <div className={cn(cnContainer, className)}>
            <BaseTimeContext.Provider value={time}>
                <TableActiveOrders
                    className={cnTable}
                    timeZone={timeZone}
                    updateTime={updateTime}
                    exportFilename={`Active_orders__[robot:${robot.id}]`}
                    getRows={getItems$}
                    refreshInfiniteCacheTrigger$={updateTrigger$}
                />
            </BaseTimeContext.Provider>
        </div>
    );
}
