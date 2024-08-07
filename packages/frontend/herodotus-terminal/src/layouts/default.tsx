import { Suspense } from '@frontend/common/src/components/Suspense';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ECommonComponents } from '@frontend/common/src/modules/layouts';
import type { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import {
    isHeroTaskConfig,
    isUrlFrameConfig,
} from '@frontend/trading-servers-manager/src/layouts/herodotus';
import type { ReactElement } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

const { ConnectedRobotTasks } = lazily(
    () =>
        import('@frontend/trading-servers-manager/src/components/PageRobot/components/RobotTasks'),
);
const { ConnectedRobotAddTask } = lazily(
    () =>
        import(
            '@frontend/trading-servers-manager/src/components/PageRobot/components/RobotAddTask'
        ),
);
const { ConnectedRobotStatusMessages } = lazily(
    () =>
        import(
            '@frontend/trading-servers-manager/src/components/PageRobot/components/RobotStatusMessages'
        ),
);
const { ConnectedFrame } = lazily(
    () => import('@frontend/common/src/components/Frame/ConnectedFrame'),
);

export enum EDefaultLayoutComponents {
    ActiveTasks = 'Active Tasks',
    ArchivedTasks = 'Archived Tasks',
    StatusMessages = 'Status Messages',
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
                        name: EDefaultLayoutComponents.ActiveTasks,
                        component: EDefaultLayoutComponents.ActiveTasks,
                        id: EDefaultLayoutComponents.ActiveTasks,
                    },
                ],
            },
            {
                type: 'tabset',
                weight: 50,
                children: [
                    {
                        type: 'tab',
                        name: EDefaultLayoutComponents.ArchivedTasks,
                        component: EDefaultLayoutComponents.ArchivedTasks,
                        id: EDefaultLayoutComponents.ArchivedTasks,
                    },
                ],
            },
        ],
    },
]);

const HeroTerminalDefaultLayout = memo(
    (props: { component: string | undefined; config: unknown; id: string }): ReactElement => {
        const { component, config, id } = props;
        let element: ReactElement | null = null;
        switch (component) {
            case ECommonComponents.AddTask: {
                const task = isHeroTaskConfig(config) ? config.task : undefined;

                element = <ConnectedRobotAddTask data={task} />;
                break;
            }
            case EDefaultLayoutComponents.ActiveTasks: {
                element = <ConnectedRobotTasks tableId={ETableIds.ActiveTasks} />;
                break;
            }
            case EDefaultLayoutComponents.ArchivedTasks: {
                element = <ConnectedRobotTasks tableId={ETableIds.ArchivedTasks} />;
                break;
            }
            case EDefaultLayoutComponents.StatusMessages: {
                element = <ConnectedRobotStatusMessages />;
                break;
            }
            case ECommonComponents.Frame: {
                const url = isUrlFrameConfig(config) ? config.url : undefined;
                element = <ConnectedFrame id={id} url={url} />;
            }
        }

        return <Suspense component={component}>{element}</Suspense>;
    },
);

export const defaultLayoutFactory: TPageLayoutFactory = (node) => {
    const component = node.getComponent();
    const id = node.getId();
    const config = node.getConfig();

    return <HeroTerminalDefaultLayout component={component} config={config} id={id} />;
};
