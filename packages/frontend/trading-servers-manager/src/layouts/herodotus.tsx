import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ECommonComponents } from '@frontend/common/src/modules/layouts';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type { THerodotusTaskFormData } from '@frontend/herodotus';
import type { TabNode } from 'flexlayout-react';
import { isEmpty, isNil, isObject, isString } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

import { robotsPageLayoutChildren, TSMRobotLayout } from './robot';

const { ConnectedRobotTasks } = lazily(
    () => import('../components/PageRobot/components/RobotTasks'),
);
const { ConnectedRobotAddTask } = lazily(
    () => import('../components/PageRobot/components/RobotAddTask'),
);

export enum EPageHerodotusLayoutComponents {
    ActiveTasks = 'Active Tasks',
    ArchivedTasks = 'Archived Tasks',
}

export const herodotusPageLayout = createLayout([
    {
        type: 'tabset',
        children: [
            ...robotsPageLayoutChildren,
            {
                type: 'tab',
                name: EPageHerodotusLayoutComponents.ActiveTasks,
                component: EPageHerodotusLayoutComponents.ActiveTasks,
                id: EPageHerodotusLayoutComponents.ActiveTasks,
            },
            {
                type: 'tab',
                name: EPageHerodotusLayoutComponents.ArchivedTasks,
                component: EPageHerodotusLayoutComponents.ArchivedTasks,
                id: EPageHerodotusLayoutComponents.ArchivedTasks,
            },
            {
                type: 'tab',
                name: ECommonComponents.AddTask,
                component: ECommonComponents.AddTask,
                id: ECommonComponents.AddTask,
            },
        ],
    },
]);

const TSMHeroLayout = memo(
    (props: { component: string | undefined; config: unknown; id: string }): ReactElement => {
        const { component, config, id } = props;
        let element: ReactElement | null = null;
        switch (component) {
            case ECommonComponents.AddTask: {
                const task = isHeroTaskConfig(config) ? config.task : undefined;
                element = <ConnectedRobotAddTask data={task} />;
                break;
            }
            case EPageHerodotusLayoutComponents.ActiveTasks: {
                element = <ConnectedRobotTasks tableId={ETableIds.ActiveTasks} />;
                break;
            }
            case EPageHerodotusLayoutComponents.ArchivedTasks: {
                element = <ConnectedRobotTasks tableId={ETableIds.ArchivedTasks} />;
                break;
            }
        }

        return (
            <TSMRobotLayout component={component} config={config} id={id}>
                {element}
            </TSMRobotLayout>
        );
    },
);

export const getComponent = (node: TabNode): ReactElement => {
    const component = node.getComponent();
    const id = node.getId();
    const config = node.getConfig();

    return <TSMHeroLayout component={component} id={id} config={config} />;
};

export function isHeroTaskConfig(config: unknown): config is {
    task: THerodotusTaskFormData;
} {
    if (isNil(config)) {
        return false;
    }

    return isObject(config) && 'task' in config && isObject(config.task);
}

export function isUrlFrameConfig(config: unknown): config is { url: string; name?: string } {
    if (isNil(config)) {
        return false;
    }

    return isObject(config) && 'url' in config && isString(config.url) && !isEmpty(config.url);
}
