import { Suspense } from '@frontend/common/src/components/Suspense';
import type { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TabNode } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout';
import type { ReactElement, ReactNode } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

import { commonLayoutFactory, commonTitleFactory } from './common';
import { EInternalTransfersLayoutComponents } from './defs';

const { WidgetInternalTransfers } = lazily(
    () => import('../widgets/layout/WidgetInternalTransfers'),
);
const { WidgetInternalTransfersHistory } = lazily(
    () => import('../widgets/layout/WidgetInternalTransfersHistory'),
);

export const internalTransfersLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'tabset',
                height: 310,
                children: [
                    {
                        type: 'tab',
                        id: EInternalTransfersLayoutComponents.InternalTransfers,
                        component: EInternalTransfersLayoutComponents.InternalTransfers,
                        name: EInternalTransfersLayoutComponents.InternalTransfers,
                    },
                ],
            },
            {
                type: 'tabset',
                children: [
                    {
                        type: 'tab',
                        id: EInternalTransfersLayoutComponents.InternalTransfersHistory,
                        component: EInternalTransfersLayoutComponents.InternalTransfersHistory,
                        name: EInternalTransfersLayoutComponents.InternalTransfersHistory,
                    },
                ],
            },
        ],
    },
]);

const InternalTransfersLayout = memo(
    ({
        component,
        permissions,
    }: {
        component: string | undefined;
        permissions: EBalanceMonitorLayoutPermissions[];
    }): ReactElement => {
        let element: ReactElement | null = null;

        switch (component) {
            case EInternalTransfersLayoutComponents.InternalTransfers: {
                element = <WidgetInternalTransfers />;
                break;
            }

            case EInternalTransfersLayoutComponents.InternalTransfersHistory: {
                element = <WidgetInternalTransfersHistory />;
                break;
            }
        }

        return (
            <Suspense component={component}>
                {element ?? commonLayoutFactory(component, permissions)}
            </Suspense>
        );
    },
);

export function internalTransfersLayoutFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): TPageLayoutFactory {
    return (node) => (
        <InternalTransfersLayout component={node.getComponent()} permissions={permissions} />
    );
}

export function internalTransfersTitleFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): (node: TabNode) => ITitleObject | ReactNode {
    return function (node: TabNode) {
        const component = node.getComponent();

        switch (component) {
            case EInternalTransfersLayoutComponents.InternalTransfers: {
                return 'Internal Transfers';
            }

            case EInternalTransfersLayoutComponents.InternalTransfersHistory: {
                return 'Internal Transfers History';
            }

            default:
                return component ?? commonTitleFactory(node, permissions);
        }
    };
}
