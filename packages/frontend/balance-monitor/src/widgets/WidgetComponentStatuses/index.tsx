import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    EComponentStatus,
    TComponentStatusInfo,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty } from 'lodash-es';
import { memo, useMemo } from 'react';

import { ModuleSubscribeToComponentStatusesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToComponentStatusesOnCurrentStage.ts';
import { ModuleToggleComponentStatusesAction } from '../../modules/actions/ModuleToggleComponentStatusesAction';
import { ComponentStatuses } from './view';

export const WidgetComponentStatuses = memo(
    ({ className, collapsed }: TWithClassname & { collapsed: boolean }) => {
        const subscribeToComponentStatuses = useModule(
            ModuleSubscribeToComponentStatusesOnCurrentStage,
        );
        const { toggleComponentStatuses } = useModule(ModuleToggleComponentStatusesAction);

        const traceId = useTraceId();

        const componentStatuses = useNotifiedValueDescriptorObservable(
            subscribeToComponentStatuses(undefined, { traceId }),
        );

        const groups = useMemo(() => {
            const groups: Partial<Record<EComponentStatus, TComponentStatusInfo[]>> = {};

            if (
                !isSyncedValueDescriptor(componentStatuses) ||
                componentStatuses.value.length === 0
            ) {
                return groups;
            }

            return componentStatuses.value.reduce((acc, componentStatusInfo) => {
                const { status } = componentStatusInfo;

                const existingComponentStatuses = acc[status] ?? [];
                existingComponentStatuses.push(componentStatusInfo);

                acc[status] = existingComponentStatuses;

                return acc;
            }, groups);
        }, [componentStatuses]);

        if (isEmpty(groups)) {
            return null;
        }

        return (
            <ComponentStatuses
                className={className}
                collapsed={collapsed}
                groups={groups}
                toggleComponentStatuses={toggleComponentStatuses}
            />
        );
    },
);
