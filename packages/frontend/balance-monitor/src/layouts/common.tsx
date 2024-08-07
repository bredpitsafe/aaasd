import { Alert } from '@frontend/common/src/components/Alert';
import type { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TabNode } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout';
import type { ReactElement, ReactNode } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

import { ELayoutIds } from './index';
import { hasPermissionsForLayout } from './utils';

const { WidgetComponentStatuses } = lazily(
    () => import('../widgets/layout/WidgetComponentStatuses'),
);
const { WidgetPumpAndDump } = lazily(() => import('../widgets/layout/WidgetPumpAndDump'));

export enum EBalanceMonitorCommonLayoutComponents {
    ComponentStatuses = 'Component Statuses',
    PumpAndDump = 'Pump & Dump',
}

export function getCommonComponents(
    permissions: EBalanceMonitorLayoutPermissions[],
): EBalanceMonitorCommonLayoutComponents[] {
    const commonComponents: EBalanceMonitorCommonLayoutComponents[] = [];

    if (hasPermissionsForLayout(ELayoutIds.BalanceMonitor, permissions)) {
        commonComponents.push(EBalanceMonitorCommonLayoutComponents.PumpAndDump);
    }

    commonComponents.push(EBalanceMonitorCommonLayoutComponents.ComponentStatuses);

    return commonComponents;
}

export function commonLayoutFactory(
    component: string | undefined,
    permissions: EBalanceMonitorLayoutPermissions[],
): ReactElement | null {
    switch (component) {
        case EBalanceMonitorCommonLayoutComponents.ComponentStatuses: {
            return <WidgetComponentStatuses />;
        }

        case EBalanceMonitorCommonLayoutComponents.PumpAndDump: {
            return hasPermissionsForLayout(ELayoutIds.BalanceMonitor, permissions) ? (
                <WidgetPumpAndDump />
            ) : (
                <NoPermissionsTabContent />
            );
        }
    }

    return null;
}

export function commonTitleFactory(
    node: TabNode,
    permissions: EBalanceMonitorLayoutPermissions[],
): ITitleObject | ReactNode {
    switch (node.getComponent()) {
        case EBalanceMonitorCommonLayoutComponents.ComponentStatuses: {
            return 'Component Statuses';
        }

        case EBalanceMonitorCommonLayoutComponents.PumpAndDump: {
            return hasPermissionsForLayout(ELayoutIds.BalanceMonitor, permissions)
                ? 'Pump & Dump'
                : NO_PERMISSIONS_TAB_TITLE;
        }

        default:
            return 'Unknown tab';
    }
}

const NO_PERMISSIONS_TAB_TITLE = 'No permissions';

const NoPermissionsTabContent = memo(() => (
    <Alert message={NO_PERMISSIONS_TAB_TITLE} type="error" showIcon />
));
