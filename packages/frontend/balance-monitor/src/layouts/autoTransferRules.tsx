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
import { EAutoTransferRulesLayoutComponents } from './defs';

const { WidgetAutoTransferRuleForm } = lazily(
    () => import('../widgets/layout/WidgetAutoTransferRuleForm'),
);
const { WidgetAutoTransferRulesList } = lazily(
    () => import('../widgets/layout/WidgetAutoTransferRulesList'),
);

export const autoTransferRulesLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'tabset',
                height: 440,
                children: [
                    {
                        type: 'tab',
                        id: EAutoTransferRulesLayoutComponents.AddAutoTransferRule,
                        component: EAutoTransferRulesLayoutComponents.AddAutoTransferRule,
                        name: EAutoTransferRulesLayoutComponents.AddAutoTransferRule,
                    },
                ],
            },
            {
                type: 'tabset',
                children: [
                    {
                        type: 'tab',
                        id: EAutoTransferRulesLayoutComponents.AutoTransferRulesList,
                        component: EAutoTransferRulesLayoutComponents.AutoTransferRulesList,
                        name: EAutoTransferRulesLayoutComponents.AutoTransferRulesList,
                    },
                ],
            },
        ],
    },
]);

const AutoTransferRulesLayout = memo(
    ({
        component,
        permissions,
    }: {
        component: string | undefined;
        permissions: EBalanceMonitorLayoutPermissions[];
    }): ReactElement => {
        let element: ReactElement | null = null;
        switch (component) {
            case EAutoTransferRulesLayoutComponents.AddAutoTransferRule: {
                element = <WidgetAutoTransferRuleForm />;
                break;
            }
            case EAutoTransferRulesLayoutComponents.AutoTransferRulesList: {
                element = <WidgetAutoTransferRulesList />;
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

export function autoTransferRulesLayoutFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): TPageLayoutFactory {
    return (node) => (
        <AutoTransferRulesLayout component={node.getComponent()} permissions={permissions} />
    );
}

export function autoTransferRulesTitleFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): (node: TabNode) => ITitleObject | ReactNode {
    return function (node: TabNode) {
        const component = node.getComponent();

        switch (component) {
            case EAutoTransferRulesLayoutComponents.AddAutoTransferRule: {
                return 'Add Auto Transfer Rule';
            }

            case EAutoTransferRulesLayoutComponents.AutoTransferRulesList: {
                return 'Auto Transfer Rules';
            }

            default:
                return component ?? commonTitleFactory(node, permissions);
        }
    };
}
