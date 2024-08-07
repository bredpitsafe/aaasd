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
import { ETransferBlockingRulesLayoutComponents } from './defs';

const { WidgetTransferBlockingRuleForm } = lazily(
    () => import('../widgets/layout/WidgetTransferBlockingRuleForm'),
);
const { WidgetTransferBlockingRulesList } = lazily(
    () => import('../widgets/layout/WidgetTransferBlockingRulesList'),
);

export const transferBlockingRulesLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'tabset',
                height: 410,
                children: [
                    {
                        type: 'tab',
                        id: ETransferBlockingRulesLayoutComponents.AddTransferBlockingRule,
                        component: ETransferBlockingRulesLayoutComponents.AddTransferBlockingRule,
                        name: ETransferBlockingRulesLayoutComponents.AddTransferBlockingRule,
                    },
                ],
            },
            {
                type: 'tabset',
                children: [
                    {
                        type: 'tab',
                        id: ETransferBlockingRulesLayoutComponents.TransferBlockingRulesList,
                        component: ETransferBlockingRulesLayoutComponents.TransferBlockingRulesList,
                        name: ETransferBlockingRulesLayoutComponents.TransferBlockingRulesList,
                    },
                ],
            },
        ],
    },
]);

const TransferBlockingRulesLayout = memo(
    ({
        component,
        permissions,
    }: {
        component: string | undefined;
        permissions: EBalanceMonitorLayoutPermissions[];
    }): ReactElement => {
        let element: ReactElement | null = null;

        switch (component) {
            case ETransferBlockingRulesLayoutComponents.AddTransferBlockingRule: {
                element = <WidgetTransferBlockingRuleForm />;
                break;
            }
            case ETransferBlockingRulesLayoutComponents.TransferBlockingRulesList: {
                element = <WidgetTransferBlockingRulesList />;
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

export function transferBlockingRulesLayoutFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): TPageLayoutFactory {
    return (node) => (
        <TransferBlockingRulesLayout component={node.getComponent()} permissions={permissions} />
    );
}

export function transferBlockingRulesTitleFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): (node: TabNode) => ITitleObject | ReactNode {
    return function (node: TabNode) {
        const component = node.getComponent();

        switch (component) {
            case ETransferBlockingRulesLayoutComponents.AddTransferBlockingRule: {
                return 'Add Transfer Blocking Rule';
            }

            case ETransferBlockingRulesLayoutComponents.TransferBlockingRulesList: {
                return 'Transfer Blocking Rules';
            }

            default:
                return component ?? commonTitleFactory(node, permissions);
        }
    };
}
