import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { uniq } from 'lodash-es';
import { memo, useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { ModuleSubscribeToCurrentPermissions } from '../../modules/actions/ModuleSubscribeToCurrentPermissions.ts';
import { ModuleSubscribeToCurrentPumpDumpInfo } from '../../modules/actions/ModuleSubscribeToCurrentPumpDumpInfo.ts';
import { ModuleTogglePumpAndDumpAction } from '../../modules/actions/ModuleTogglePumpAndDumpAction';
import { PumpAndDump } from './view';

export const WidgetPumpAndDump = memo(
    ({ className, collapsed }: TWithClassname & { collapsed: boolean }) => {
        const traceId = useTraceId();
        const { togglePumpAndDump } = useModule(ModuleTogglePumpAndDumpAction);
        const subscribeToPermissions = useModule(ModuleSubscribeToCurrentPermissions);
        const subscribeToPumpDumpInfo = useModule(ModuleSubscribeToCurrentPumpDumpInfo);

        const permissionsDesc = useNotifiedValueDescriptorObservable(
            subscribeToPermissions(undefined, { traceId }),
        );

        const hasPermissions = useMemo(
            () =>
                isSyncedValueDescriptor(permissionsDesc)
                    ? permissionsDesc.value.includes(
                          EBalanceMonitorLayoutPermissions.BalanceMonitor,
                      )
                    : false,
            [permissionsDesc],
        );

        const pumpDumpInfo = useNotifiedValueDescriptorObservable(
            hasPermissions ? subscribeToPumpDumpInfo(undefined, { traceId }) : EMPTY,
        );

        const flaggedCoinCount = isSyncedValueDescriptor(pumpDumpInfo)
            ? uniq(pumpDumpInfo.value.filter(({ flagged }) => flagged).map(({ coin }) => coin))
                  .length
            : 0;

        if (!hasPermissions) {
            return null;
        }

        return (
            <PumpAndDump
                className={className}
                collapsed={collapsed}
                flaggedCoinCount={flaggedCoinCount}
                togglePumpAndDump={togglePumpAndDump}
            />
        );
    },
);
