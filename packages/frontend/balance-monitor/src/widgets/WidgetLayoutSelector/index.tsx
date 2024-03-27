import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Link } from '@frontend/common/src/components/Link';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { getLayoutId, hasPermissionsForLayout } from '../../layouts/utils';
import { ModuleCurrentLayoutId } from '../../modules/observables/ModuleCurrentLayoutId';
import { ModulePermissions } from '../../modules/observables/ModulePermissions';
import { EBalanceMonitorRoute } from '../../modules/router/def';
import { ModuleBalanceMonitorRouter } from '../../modules/router/module';
import { LayoutSelector } from './LayoutSelector';
import { cnFloatLinkButton, cnLinkButton } from './view.css';

export const WidgetLayoutSelector = memo(({ type }: { type: ENavType }) => {
    const { getPermissions$ } = useModule(ModulePermissions);
    const { state$ } = useModule(ModuleBalanceMonitorRouter);
    const { currentLayoutId$ } = useModule(ModuleCurrentLayoutId);

    const routeState = useSyncObservable(state$);
    const currentLayoutId = useSyncObservable(currentLayoutId$);

    const traceId = useTraceId();

    const permissionsDesc = useValueDescriptorObservableDeprecated(getPermissions$(traceId));

    if (isNil(currentLayoutId) || !isSyncDesc(permissionsDesc)) {
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
