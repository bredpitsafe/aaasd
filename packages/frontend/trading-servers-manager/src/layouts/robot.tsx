import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { TWithChild } from '@frontend/common/src/types/components';
import type { TabNode } from 'flexlayout-react';
import type { ReactElement } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

import { ConnectedBoundDashboards } from '../components/BoundDashboardsFrame';
import { TSMDefaultLayout } from './default';

const { ConnectedCurrentRobotState } = lazily(
    () => import('../components/PageRobot/components/ConnectedCurrentRobotState'),
);
const { ConnectedRobotActiveOrders } = lazily(
    () => import('../components/PageRobot/components/RobotActiveOrders'),
);
const { ConnectedRobotCommand } = lazily(
    () => import('../components/PageRobot/components/RobotCommand'),
);
const { ConnectedRobotConfig } = lazily(
    () => import('../components/PageRobot/components/RobotConfig'),
);
const { ConnectedRobotCustomView } = lazily(
    () => import('../components/PageRobot/components/RobotCustomView'),
);
const { ConnectedRobotDashboards } = lazily(
    () => import('../components/PageRobot/components/RobotDashboards'),
);
const { ConnectedRobotStatusMessages } = lazily(
    () => import('../components/PageRobot/components/RobotStatusMessages'),
);
const { WidgetRobotBalances } = lazily(() => import('../widgets/Tabs/Robots/Balances'));
const { WidgetRobotPositions } = lazily(() => import('../widgets/Tabs/Robots/Positions'));

export enum EPageRobotsLayoutComponents {
    Config = 'Config',
    State = 'State',
    CustomView = 'Custom View',
    StatusMessages = 'Status Messages',
    ActiveOrders = 'Active Orders',
    Command = 'Command',
    Dashboards = 'Dashboards',
    RobotPositions = 'Robot Positions',
    RobotBalances = 'Robot Balances',
    BoundDashboards = 'Bound Dashboards',
}

export const robotsPageLayoutChildren = [
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.Config,
        component: EPageRobotsLayoutComponents.Config,
        id: EPageRobotsLayoutComponents.Config,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.State,
        component: EPageRobotsLayoutComponents.State,
        id: EPageRobotsLayoutComponents.State,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.BoundDashboards,
        component: EPageRobotsLayoutComponents.BoundDashboards,
        id: EPageRobotsLayoutComponents.BoundDashboards,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.CustomView,
        component: EPageRobotsLayoutComponents.CustomView,
        id: EPageRobotsLayoutComponents.CustomView,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.ActiveOrders,
        component: EPageRobotsLayoutComponents.ActiveOrders,
        id: EPageRobotsLayoutComponents.ActiveOrders,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.Command,
        component: EPageRobotsLayoutComponents.Command,
        id: EPageRobotsLayoutComponents.Command,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.StatusMessages,
        component: EPageRobotsLayoutComponents.StatusMessages,
        id: EPageRobotsLayoutComponents.StatusMessages,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.Dashboards,
        component: EPageRobotsLayoutComponents.Dashboards,
        id: EPageRobotsLayoutComponents.Dashboards,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.RobotPositions,
        component: EPageRobotsLayoutComponents.RobotPositions,
        id: EPageRobotsLayoutComponents.RobotPositions,
    },
    {
        type: 'tab',
        name: EPageRobotsLayoutComponents.RobotBalances,
        component: EPageRobotsLayoutComponents.RobotBalances,
        id: EPageRobotsLayoutComponents.RobotBalances,
    },
];

export const robotsPageLayout = createLayout([
    {
        type: 'tabset',
        children: robotsPageLayoutChildren,
    },
]);

export const TSMRobotLayout = memo(
    (
        props: TWithChild & { component: string | undefined; config: unknown; id: string },
    ): ReactElement => {
        const { component, config, id, children } = props;
        let element: ReactElement | null = null;
        switch (component) {
            case EPageRobotsLayoutComponents.Config: {
                element = <ConnectedRobotConfig />;
                break;
            }
            case EPageRobotsLayoutComponents.State: {
                element = <ConnectedCurrentRobotState />;
                break;
            }
            case EPageRobotsLayoutComponents.BoundDashboards: {
                element = <ConnectedBoundDashboards />;
                break;
            }
            case EPageRobotsLayoutComponents.CustomView: {
                element = <ConnectedRobotCustomView />;
                break;
            }
            case EPageRobotsLayoutComponents.StatusMessages: {
                element = <ConnectedRobotStatusMessages />;
                break;
            }
            case EPageRobotsLayoutComponents.ActiveOrders: {
                element = <ConnectedRobotActiveOrders />;
                break;
            }
            case EPageRobotsLayoutComponents.Command: {
                element = <ConnectedRobotCommand />;
                break;
            }
            case EPageRobotsLayoutComponents.Dashboards: {
                element = <ConnectedRobotDashboards />;
                break;
            }
            case EPageRobotsLayoutComponents.RobotPositions: {
                element = <WidgetRobotPositions />;
                break;
            }
            case EPageRobotsLayoutComponents.RobotBalances: {
                element = <WidgetRobotBalances />;
                break;
            }
            default: {
                element = <>{children}</>;
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

    return <TSMRobotLayout component={component} id={id} config={config} />;
};
