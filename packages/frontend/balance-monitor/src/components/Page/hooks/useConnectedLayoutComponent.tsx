import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { ValueOf } from '@frontend/common/src/types';
import { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isNil } from 'lodash-es';
import { ReactNode, useMemo } from 'react';

import {
    getLayoutComponents,
    getSubLayoutFactory,
    getSubLayoutTitleFactory,
} from '../../../layouts';
import { getLayoutId } from '../../../layouts/utils';
import { ModulePermissions } from '../../../modules/observables/ModulePermissions';
import { EBalanceMonitorRoute } from '../../../modules/router/def';
import { ModuleBalanceMonitorRouter } from '../../../modules/router/module';

export function useConnectedLayoutComponent(): [ReactNode, VoidFunction, string[]] {
    const { state$, setParams } = useModule(ModuleBalanceMonitorRouter);
    const { getPermissions$ } = useModule(ModulePermissions);

    const routeState = useSyncObservable(state$);
    const routeName = routeState?.route?.name as undefined | ValueOf<typeof EBalanceMonitorRoute>;

    const traceId = useTraceId();

    const permissionsDesc = useValueDescriptorObservableDeprecated(getPermissions$(traceId));

    const permissions = isSyncDesc(permissionsDesc)
        ? permissionsDesc.value
        : (EMPTY_ARRAY as EBalanceMonitorLayoutPermissions[]);

    const handleSelectTab = useFunction((tab: string) => {
        void setParams({ tab });
    });

    const layoutId = useMemo(() => getLayoutId(routeName), [routeName]);

    const subFactory = useMemo(
        () => getSubLayoutFactory(layoutId, permissions),
        [layoutId, permissions],
    );

    const titleFactory = useMemo(
        () => getSubLayoutTitleFactory(layoutId, permissions),
        [layoutId, permissions],
    );

    const layoutComponents = useMemo(
        () => getLayoutComponents(layoutId, permissions),
        [layoutId, permissions],
    );

    const layout = useLayout({
        layoutId,
        factory: subFactory,
        onSelectTab: handleSelectTab,
        titleFactory,
    });

    const component = useMemo(() => {
        if (!isNil(subFactory)) {
            return layout.component;
        }

        if (isSyncDesc(permissionsDesc)) {
            return <Error title="Not enough permissions" status="error" />;
        }

        return <LoadingOverlay text="Loading permissions..." />;
    }, [subFactory, layout.component, permissionsDesc]);

    return [component, layout.onResetLayout, layoutComponents];
}
