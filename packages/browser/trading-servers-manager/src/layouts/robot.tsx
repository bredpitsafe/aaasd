import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TWithChild } from '@frontend/common/src/types/components';
import { TabNode } from 'flexlayout-react';
import { memo, ReactElement } from 'react';
import { lazily } from 'react-lazily';

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

export enum EPageRobotsLayoutComponents {
    Config = 'Config',
    State = 'State',
    CustomView = 'Custom View',
    StatusMessages = 'Status Messages',
    ActiveOrders = 'Active Orders',
    Command = 'Command',
    Dashboards = 'Dashboards',
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
            case EPageRobotsLayoutComponents.CustomView: {
                element = <ConnectedRobotCustomView />;
                break;
            }
            case EPageRobotsLayoutComponents.StatusMessages: {
                element = (
                    <ConnectedRobotStatusMessages
                        applicationName={EApplicationName.TradingServersManager}
                    />
                );
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
