import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { TabNode } from 'flexlayout-react';
import type { ReactElement } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

import { ConnectedBoundDashboards } from '../components/BoundDashboardsFrame';
import { TSMDefaultLayout } from './default';

const { ConnectedGateConfig } = lazily(
    () => import('../components/PageGate/components/GateConfig'),
);
const { ConnectedGateCustomView } = lazily(
    () => import('../components/PageGate/components/GateCustomView'),
);
const { ConnectedGateStatusMessages } = lazily(
    () => import('../components/PageGate/components/GateStatusMessages'),
);

export enum EPageGatesLayoutComponents {
    Config = 'Config',
    CustomView = 'Custom View',
    BoundDashboards = 'Bound Dashboards',
    StatusMessages = 'Status Messages',
}

export const gatesPageLayout = createLayout([
    {
        type: 'tabset',
        children: [
            {
                type: 'tab',
                name: EPageGatesLayoutComponents.Config,
                component: EPageGatesLayoutComponents.Config,
                id: EPageGatesLayoutComponents.Config,
            },
            {
                type: 'tab',
                name: EPageGatesLayoutComponents.BoundDashboards,
                component: EPageGatesLayoutComponents.BoundDashboards,
                id: EPageGatesLayoutComponents.BoundDashboards,
            },
            {
                type: 'tab',
                name: EPageGatesLayoutComponents.CustomView,
                component: EPageGatesLayoutComponents.CustomView,
                id: EPageGatesLayoutComponents.CustomView,
            },
            {
                type: 'tab',
                name: EPageGatesLayoutComponents.StatusMessages,
                component: EPageGatesLayoutComponents.StatusMessages,
                id: EPageGatesLayoutComponents.StatusMessages,
            },
        ],
    },
]);

const TSMGateLayout = memo(
    (props: { component: string | undefined; config: unknown; id: string }): ReactElement => {
        const { component, config, id } = props;
        let element: ReactElement | null = null;
        switch (component) {
            case EPageGatesLayoutComponents.Config: {
                element = <ConnectedGateConfig />;
                break;
            }
            case EPageGatesLayoutComponents.BoundDashboards: {
                element = <ConnectedBoundDashboards />;
                break;
            }
            case EPageGatesLayoutComponents.CustomView: {
                element = <ConnectedGateCustomView />;
                break;
            }
            case EPageGatesLayoutComponents.StatusMessages: {
                element = <ConnectedGateStatusMessages />;
                break;
            }
        }

        return (
            <TSMDefaultLayout component={component} config={config} id={id}>
                {element}
            </TSMDefaultLayout>
        );
    },
);

export const getComponent = (node: TabNode): ReactElement => {
    const component = node.getComponent();
    const id = node.getId();
    const config = node.getConfig();

    return <TSMGateLayout component={component} id={id} config={config} />;
};
