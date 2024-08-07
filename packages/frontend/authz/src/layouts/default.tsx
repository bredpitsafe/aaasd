import { Suspense } from '@frontend/common/src/components/Suspense';
import type { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { ReactElement } from 'react';
import { memo } from 'react';

import { WidgetTableGroups } from '../widgets/WidgetTableGroups.tsx';
import { WidgetTablePolicies } from '../widgets/WidgetTablePolicies.tsx';
import { WidgetTableUsers } from '../widgets/WidgetTableUsers.tsx';

export enum EDefaultLayoutComponents {
    Users = 'Users',
    Groups = 'Groups',
    Policies = 'Policies',
}

export const defaultLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'tabset',
                weight: 50,
                children: [
                    {
                        type: 'tab',
                        id: EDefaultLayoutComponents.Users,
                        name: EDefaultLayoutComponents.Users,
                        component: EDefaultLayoutComponents.Users,
                    },
                    {
                        type: 'tab',
                        id: EDefaultLayoutComponents.Groups,
                        name: EDefaultLayoutComponents.Groups,
                        component: EDefaultLayoutComponents.Groups,
                    },
                    {
                        type: 'tab',
                        id: EDefaultLayoutComponents.Policies,
                        name: EDefaultLayoutComponents.Policies,
                        component: EDefaultLayoutComponents.Policies,
                    },
                ],
            },
        ],
    },
]);

const DefaultLayout = memo(
    (props: { component: string | undefined; config: unknown; id: string }): ReactElement => {
        const { component } = props;
        let element: ReactElement | null = null;

        switch (component) {
            default:
                element = null;
                break;
            case EDefaultLayoutComponents.Users: {
                element = <WidgetTableUsers />;
                break;
            }
            case EDefaultLayoutComponents.Groups: {
                element = <WidgetTableGroups />;
                break;
            }
            case EDefaultLayoutComponents.Policies: {
                element = <WidgetTablePolicies />;
                break;
            }
        }

        return <Suspense component={component}>{element}</Suspense>;
    },
);

export const defaultLayoutFactory: TPageLayoutFactory = (node) => {
    const id = node.getId();
    const config = node.getConfig();
    const component = node.getComponent();

    return <DefaultLayout component={component} config={config} id={id} />;
};
