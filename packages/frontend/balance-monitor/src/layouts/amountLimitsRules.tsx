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
import { EAmountLimitsRulesLayoutComponents } from './defs';

const { WidgetAmountLimitsRuleForm } = lazily(
    () => import('../widgets/layout/WidgetAmountLimitsRuleForm'),
);
const { WidgetAmountLimitsRulesList } = lazily(
    () => import('../widgets/layout/WidgetAmountLimitsRulesList'),
);

export const amountLimitsRulesLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'tabset',
                height: 440,
                children: [
                    {
                        type: 'tab',
                        id: EAmountLimitsRulesLayoutComponents.AddAmountLimitsRule,
                        component: EAmountLimitsRulesLayoutComponents.AddAmountLimitsRule,
                        name: EAmountLimitsRulesLayoutComponents.AddAmountLimitsRule,
                    },
                ],
            },
            {
                type: 'tabset',
                children: [
                    {
                        type: 'tab',
                        id: EAmountLimitsRulesLayoutComponents.AmountLimitsRulesList,
                        component: EAmountLimitsRulesLayoutComponents.AmountLimitsRulesList,
                        name: EAmountLimitsRulesLayoutComponents.AmountLimitsRulesList,
                    },
                ],
            },
        ],
    },
]);

const AmountLimitsRulesLayout = memo(
    ({
        component,
        permissions,
    }: {
        component: string | undefined;
        permissions: EBalanceMonitorLayoutPermissions[];
    }): ReactElement => {
        let element: ReactElement | null = null;
        switch (component) {
            case EAmountLimitsRulesLayoutComponents.AddAmountLimitsRule: {
                element = <WidgetAmountLimitsRuleForm />;
                break;
            }
            case EAmountLimitsRulesLayoutComponents.AmountLimitsRulesList: {
                element = <WidgetAmountLimitsRulesList />;
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

export function amountLimitsRulesLayoutFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): TPageLayoutFactory {
    return (node) => (
        <AmountLimitsRulesLayout component={node.getComponent()} permissions={permissions} />
    );
}

export function amountLimitsRulesTitleFactory(
    permissions: EBalanceMonitorLayoutPermissions[],
): (node: TabNode) => ITitleObject | ReactNode {
    return function (node: TabNode) {
        const component = node.getComponent();

        switch (component) {
            case EAmountLimitsRulesLayoutComponents.AddAmountLimitsRule: {
                return 'Add Amount Limits Rule';
            }

            case EAmountLimitsRulesLayoutComponents.AmountLimitsRulesList: {
                return 'Amount Limits Rules';
            }

            default:
                return component ?? commonTitleFactory(node, permissions);
        }
    };
}
