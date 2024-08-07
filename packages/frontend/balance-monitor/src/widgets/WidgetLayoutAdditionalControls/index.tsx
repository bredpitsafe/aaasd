import { assertNever } from '@common/utils/src/assert.ts';
import type { ENavType } from '@frontend/common/src/actors/Settings/types';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { ELayoutIds } from '../../layouts';
import { hasPermissionsForLayout } from '../../layouts/utils';
import { ModuleCurrentLayoutId } from '../../modules/actions/ModuleCurrentLayoutId.ts';
import { ModuleSubscribeToCurrentPermissions } from '../../modules/actions/ModuleSubscribeToCurrentPermissions.ts';
import { BalanceMonitorAdditionalControls } from './BalanceMonitorAdditionalControls';

export const WidgetLayoutAdditionalControls = memo(
    ({
        className,
        type,
    }: TWithClassname & {
        type: ENavType;
    }) => {
        const traceId = useTraceId();
        const subscribeToPermissions = useModule(ModuleSubscribeToCurrentPermissions);

        const { currentLayoutId$ } = useModule(ModuleCurrentLayoutId);

        const currentLayoutId = useSyncObservable(currentLayoutId$);

        const permissionsDesc = useNotifiedValueDescriptorObservable(
            subscribeToPermissions(undefined, { traceId }),
        );

        if (
            isNil(currentLayoutId) ||
            !isSyncedValueDescriptor(permissionsDesc) ||
            !hasPermissionsForLayout(currentLayoutId, permissionsDesc.value)
        ) {
            return null;
        }

        switch (currentLayoutId) {
            case ELayoutIds.BalanceMonitor:
                return <BalanceMonitorAdditionalControls className={className} type={type} />;
            case ELayoutIds.InternalTransfers:
                return null;
            case ELayoutIds.TransferBlockingRules:
                return null;
            case ELayoutIds.AmountLimitsRules:
                return null;
            case ELayoutIds.AutoTransferRules:
                return null;
            default:
                assertNever(currentLayoutId);
        }
    },
);
