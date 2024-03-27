import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import {
    EComponentStatus,
    TComponentStatusInfo,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isEmpty } from 'lodash-es';
import { memo, useMemo } from 'react';

import { ModuleToggleComponentStatusesAction } from '../../modules/actions/ModuleToggleComponentStatusesAction';
import { ModuleComponentStatuses } from '../../modules/observables/ModuleComponentStatuses';
import { ComponentStatuses } from './view';

export const WidgetComponentStatuses = memo(
    ({ className, collapsed }: TWithClassname & { collapsed: boolean }) => {
        const { getComponentStatuses$ } = useModule(ModuleComponentStatuses);
        const { toggleComponentStatuses } = useModule(ModuleToggleComponentStatusesAction);

        const traceId = useTraceId();

        const componentStatuses = useSyncObservable(
            getComponentStatuses$(traceId),
            useMemo(() => UnscDesc(null), []),
        );

        const groups = useMemo(() => {
            const groups: Partial<Record<EComponentStatus, TComponentStatusInfo[]>> = {};

            if (
                !isSyncDesc(componentStatuses) ||
                !Array.isArray(componentStatuses.value) ||
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
