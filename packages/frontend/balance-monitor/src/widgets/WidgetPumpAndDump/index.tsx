import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { uniq } from 'lodash-es';
import { memo, useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { ModuleTogglePumpAndDumpAction } from '../../modules/actions/ModuleTogglePumpAndDumpAction';
import { ModulePermissions } from '../../modules/observables/ModulePermissions';
import { ModulePumpDumpInfo } from '../../modules/observables/ModulePumpDumpInfo';
import { PumpAndDump } from './view';

export const WidgetPumpAndDump = memo(
    ({ className, collapsed }: TWithClassname & { collapsed: boolean }) => {
        const { getPermissions$ } = useModule(ModulePermissions);
        const { togglePumpAndDump } = useModule(ModuleTogglePumpAndDumpAction);
        const { getPumpDumpInfo$ } = useModule(ModulePumpDumpInfo);

        const traceId = useTraceId();

        const permissionsDesc = useValueDescriptorObservableDeprecated(getPermissions$(traceId));

        const hasPermissions = useMemo(
            () =>
                isSyncDesc(permissionsDesc)
                    ? permissionsDesc.value.includes(
                          EBalanceMonitorLayoutPermissions.BalanceMonitor,
                      )
                    : false,
            [permissionsDesc],
        );

        const pumpDumpInfo = useSyncObservable(
            hasPermissions ? getPumpDumpInfo$(traceId) : EMPTY,
            useMemo(() => UnscDesc(null), []),
        );

        const flaggedCoinCount = isSyncDesc(pumpDumpInfo)
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
