import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Link } from '@frontend/common/src/components/Link';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { getLayoutId, hasPermissionsForLayout } from '../../layouts/utils';
import { ModuleCurrentLayoutId } from '../../modules/actions/ModuleCurrentLayoutId.ts';
import { ModuleSubscribeToCurrentPermissions } from '../../modules/actions/ModuleSubscribeToCurrentPermissions.ts';
import { EBalanceMonitorRoute } from '../../modules/router/def';
import { ModuleBalanceMonitorRouter } from '../../modules/router/module';
import { LayoutSelector } from './LayoutSelector';
import { cnFloatLinkButton, cnLinkButton } from './view.css';

export const WidgetLayoutSelector = memo(({ type }: { type: ENavType }) => {
    const traceId = useTraceId();
    const subscribeToPermissions = useModule(ModuleSubscribeToCurrentPermissions);
    const { state$ } = useModule(ModuleBalanceMonitorRouter);
    const { currentLayoutId$ } = useModule(ModuleCurrentLayoutId);

    const routeState = useSyncObservable(state$);
    const currentLayoutId = useSyncObservable(currentLayoutId$);

    const permissionsDesc = useNotifiedValueDescriptorObservable(
        subscribeToPermissions(undefined, { traceId }),
    );

    if (isNil(currentLayoutId) || !isSyncedValueDescriptor(permissionsDesc)) {
        return null;
    }

    return (
        <>
            {[
                EBalanceMonitorRoute.BalanceMonitor,
                EBalanceMonitorRoute.InternalTransfers,
                EBalanceMonitorRoute.TransferBlockingRules,
                EBalanceMonitorRoute.AmountLimitsRules,
                EBalanceMonitorRoute.AutoTransferRules,
            ]
                .map((routeName) => ({ routeName, layoutId: getLayoutId(routeName) }))
                .filter(({ layoutId }) => hasPermissionsForLayout(layoutId, permissionsDesc.value))
                .map(({ routeName, layoutId }) => (
                    <Link
                        key={routeName}
                        className={type === ENavType.Hidden ? cnFloatLinkButton : cnLinkButton}
                        routeName={routeName}
                        routeParams={{
                            ...routeState?.route?.params,
                            tab: undefined,
                            createTab: undefined,
                            singleTab: undefined,
                        }}
                    >
                        <LayoutSelector
                            layoutId={layoutId}
                            selected={layoutId === currentLayoutId}
                            type={type}
                        />
                    </Link>
                ))}
        </>
    );
});
