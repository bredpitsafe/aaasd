import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import { EConfigsTabTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/configs-tab/configs.tab.selectors';
import { EDetailsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/details-tab/details.tab.selectors';
import { ERunsInfoTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-info-tab/runs-info.tab.selectors';
import { ERunsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-tab/runs.tab.selectors';
import { EStatesTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/states-tab/states.tab.selectors';
import { ETasksTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/tasks-tab/tasks.tab.selectors';
import { ConnectedFrame } from '@frontend/common/src/components/Frame/ConnectedFrame';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { Tag } from '@frontend/common/src/components/Tag';
import { ECommonComponents } from '@frontend/common/src/modules/layouts';
import type { TPageLayoutFactory } from '@frontend/common/src/modules/layouts/data';
import { createLayout } from '@frontend/common/src/modules/layouts/utils';
import type {
    TBacktestingRun,
    TBacktestingTask,
} from '@frontend/common/src/types/domain/backtestings';
import { cnFit } from '@frontend/common/src/utils/css/common.css';
import cn from 'classnames';
import type { TabNode } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout';
import { isEmpty, isNil, isObject, isString } from 'lodash-es';
import type { ReactElement, ReactNode } from 'react';
import { memo } from 'react';
import { lazily } from 'react-lazily';

import type { TFormBacktestingTask } from '../components/Forms/FormCreateBacktestingTask/defs';
import { cnTabContentWithPadding } from '../components/Layout/view.css';
import { cnTabTag } from './view.css';

const { WidgetBacktestingRunStates } = lazily(
    () => import('../widgets/WidgetBacktestingRunStates/WidgetBacktestingRunStates'),
);
const { WidgetBacktestingRunBuildInfo } = lazily(
    () => import('../widgets/WidgetBacktestingRunBuildInfo'),
);
const { WidgetBacktestingRunConfigs } = lazily(
    () => import('../widgets/WidgetBacktestingRunConfigs'),
);
const { WidgetBacktestingRuns } = lazily(() => import('../widgets/WidgetBacktestingRuns'));
const { WidgetBacktestingRunsInfo } = lazily(() => import('../widgets/WidgetBacktestingRunsInfo'));
const { WidgetBacktestingTask } = lazily(() => import('../widgets/WidgetBacktestingTask'));
const { WidgetBacktestingTasks } = lazily(() => import('../widgets/WidgetBacktestingTasks'));
const { WidgetCreateTask } = lazily(() => import('../widgets/WidgetCreateTask/WidgetCreateTask'));
const { WidgetOrderBook } = lazily(() => import('../widgets/WidgetOrderBook'));
const { WidgetTableDashboards } = lazily(() => import('../widgets/WidgetTableDashboards'));
const { WidgetTableIndicators } = lazily(() => import('../widgets/WidgetTableIndicators'));
const { WidgetTableProductLogs } = lazily(() => import('../widgets/WidgetTableProductLogs'));

export enum EDefaultLayoutComponents {
    Tasks = 'Tasks',
    Task = 'Task',
    Runs = 'Runs',
    RunConfigs = 'Run Configs',
    RunStates = 'Run States',
    RunBuildInfo = 'Run Build Info',
    Dashboards = 'Dashboards',
    Indicators = 'Indicators',
    IndicatorsDashboard = 'Indicators Dashboard',
    RobotDashboard = 'Robot Dashboard',
    ProductLogs = 'Product Logs',
    OrderBook = 'Order Book',
    RunsInfo = 'Runs Info',
}

export const defaultLayout = createLayout([
    {
        type: 'row',
        children: [
            {
                type: 'row',
                weight: 60,
                children: [
                    {
                        type: 'tabset',
                        width: 1000,
                        children: [
                            {
                                type: 'tab',
                                enableClose: false,
                                name: EDefaultLayoutComponents.Tasks,
                                component: EDefaultLayoutComponents.Tasks,
                                id: EDefaultLayoutComponents.Tasks,
                            },
                        ],
                    },
                    {
                        type: 'tabset',
                        weight: 34,
                        minWidth: 300,
                        children: [
                            {
                                type: 'tab',
                                name: EDefaultLayoutComponents.Dashboards,
                                component: EDefaultLayoutComponents.Dashboards,
                                id: EDefaultLayoutComponents.Dashboards,
                            },
                        ],
                    },
                ],
            },
            {
                type: 'tabset',
                weight: 30,
                children: [
                    {
                        type: 'tab',
                        id: EDefaultLayoutComponents.Runs,
                        name: EDefaultLayoutComponents.Runs,
                        component: EDefaultLayoutComponents.Runs,
                    },
                    {
                        type: 'tab',
                        id: EDefaultLayoutComponents.RunsInfo,
                        name: EDefaultLayoutComponents.RunsInfo,
                        component: EDefaultLayoutComponents.RunsInfo,
                    },
                ],
            },
            {
                type: 'tabset',
                children: [
                    {
                        type: 'tab',
                        name: EDefaultLayoutComponents.Task,
                        component: EDefaultLayoutComponents.Task,
                        id: EDefaultLayoutComponents.Task,
                    },
                    {
                        type: 'tab',
                        name: EDefaultLayoutComponents.RunConfigs,
                        component: EDefaultLayoutComponents.RunConfigs,
                        id: EDefaultLayoutComponents.RunConfigs,
                    },
                    {
                        type: 'tab',
                        name: EDefaultLayoutComponents.RunStates,
                        component: EDefaultLayoutComponents.RunStates,
                        id: EDefaultLayoutComponents.RunStates,
                    },
                    {
                        type: 'tab',
                        name: EDefaultLayoutComponents.RunBuildInfo,
                        component: EDefaultLayoutComponents.RunBuildInfo,
                        id: EDefaultLayoutComponents.RunBuildInfo,
                    },
                    {
                        type: 'tab',
                        name: EDefaultLayoutComponents.Indicators,
                        component: EDefaultLayoutComponents.Indicators,
                        id: EDefaultLayoutComponents.Indicators,
                    },
                    {
                        type: 'tab',
                        name: EDefaultLayoutComponents.ProductLogs,
                        component: EDefaultLayoutComponents.ProductLogs,
                        id: EDefaultLayoutComponents.ProductLogs,
                    },
                ],
            },
        ],
    },
]);

const BacktestingDefaultLayout = memo(
    (props: {
        component: string | undefined;
        id: string;
        config: object | undefined;
    }): ReactElement => {
        const { component, id, config } = props;
        let element: ReactElement | null = null;
        switch (component) {
            case ECommonComponents.AddTask: {
                element = isBacktestingTaskConfig(config) ? (
                    <WidgetCreateTask
                        className={cn(
                            cnFit,
                            cnTabContentWithPadding,
                            EAddTaskTabSelectors.AddTaskTab,
                        )}
                        task={config.task}
                    />
                ) : (
                    <WidgetCreateTask
                        className={cn(
                            cnFit,
                            cnTabContentWithPadding,
                            EAddTaskTabSelectors.AddTaskTab,
                        )}
                    />
                );
                break;
            }
            case EDefaultLayoutComponents.Tasks: {
                element = (
                    <WidgetBacktestingTasks
                        className={cn(cnFit, cnTabContentWithPadding, ETasksTabSelectors.TasksTab)}
                    />
                );
                break;
            }
            case EDefaultLayoutComponents.Task: {
                element = (
                    <WidgetBacktestingTask
                        className={cn(
                            cnFit,
                            cnTabContentWithPadding,
                            EDetailsTabSelectors.DetailsTab,
                        )}
                    />
                );
                break;
            }
            case EDefaultLayoutComponents.Runs: {
                element = (
                    <WidgetBacktestingRuns className={cn(cnFit, ERunsTabSelectors.RunsTab)} />
                );
                break;
            }
            case EDefaultLayoutComponents.RunConfigs: {
                element = (
                    <WidgetBacktestingRunConfigs
                        className={cn(cnFit, EConfigsTabTabSelectors.ConfigsTab)}
                    />
                );
                break;
            }
            case EDefaultLayoutComponents.RunStates: {
                element = (
                    <WidgetBacktestingRunStates
                        className={cn(cnFit, EStatesTabSelectors.StatesTab)}
                    />
                );
                break;
            }
            case EDefaultLayoutComponents.RunBuildInfo: {
                element = (
                    <WidgetBacktestingRunBuildInfo className={cn(cnFit, cnTabContentWithPadding)} />
                );
                break;
            }
            case EDefaultLayoutComponents.RunsInfo: {
                element = (
                    <WidgetBacktestingRunsInfo
                        className={cn(cnFit, ERunsInfoTabSelectors.RunsInfoTab)}
                    />
                );
                break;
            }
            case EDefaultLayoutComponents.Dashboards: {
                element = <WidgetTableDashboards className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.Indicators: {
                element = <WidgetTableIndicators className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.ProductLogs: {
                element = <WidgetTableProductLogs className={cnFit} />;
                break;
            }
            case EDefaultLayoutComponents.OrderBook: {
                element = <WidgetOrderBook className={cnFit} />;
                break;
            }
            case ECommonComponents.Frame: {
                element = (
                    <ConnectedFrame
                        id={id}
                        url={isUrlFrameConfig(config) ? config.url : undefined}
                    />
                );
                break;
            }
        }

        return <Suspense component={props.component}>{element}</Suspense>;
    },
);

export const defaultLayoutFactory: TPageLayoutFactory = (node) => {
    const component = node.getComponent();
    const config = node.getConfig();
    const id = node.getId();

    return <BacktestingDefaultLayout component={component} id={id} config={config} />;
};

export function getTitleFactory(
    taskId: undefined | TBacktestingTask['id'],
    runId: undefined | TBacktestingRun['btRunNo'],
): (node: TabNode) => ITitleObject | ReactNode {
    return (node) => {
        const component = node.getComponent();

        switch (component) {
            case ECommonComponents.AddTask: {
                const config = node.getConfig();
                return (
                    <TaskTitle
                        taskId={isBacktestingTaskConfig(config) ? config.task.id : undefined}
                        label="Clone"
                        altLabel="Add Task"
                    />
                );
            }

            case EDefaultLayoutComponents.Tasks:
                return 'Tasks';

            case EDefaultLayoutComponents.Task:
                return <TaskTitle taskId={taskId} label="Details" altLabel="Task" />;

            case EDefaultLayoutComponents.Runs:
                return <TaskTitle taskId={taskId} label="Runs" />;

            case EDefaultLayoutComponents.RunConfigs:
                return <RunTitle runId={runId} label="Configs" altLabel="Run Configs" />;

            case EDefaultLayoutComponents.RunStates:
                return <RunTitle runId={runId} label="States" altLabel="Run States" />;

            case EDefaultLayoutComponents.RunBuildInfo:
                return <RunTitle runId={runId} label="Build Info" altLabel="Run Build Info" />;

            case EDefaultLayoutComponents.RunsInfo:
                return <TaskTitle taskId={taskId} label="Runs Info" />;

            case EDefaultLayoutComponents.Dashboards:
                return <RunTitle runId={runId} label="Dashboards" />;

            case EDefaultLayoutComponents.Indicators:
                return <RunTitle runId={runId} label="Indicators" />;

            case EDefaultLayoutComponents.ProductLogs:
                return <RunTitle runId={runId} label="Product Logs" />;

            case EDefaultLayoutComponents.OrderBook:
                return <RunTitle runId={runId} label="Order book" />;

            case ECommonComponents.Frame:
                const config = node.getConfig();
                const name = isUrlFrameConfig(config) ? config.name : undefined;
                const metaRunId = isExtendedWithBacktestingRunId(config)
                    ? config.meta.runId
                    : undefined;

                return <RunTitle runId={metaRunId} label={isNil(name) ? 'Frame' : name} />;

            default:
                throw new Error(`BackTesting layouts doesn't support component "${component}"`);
        }
    };
}

const TaskTitle = memo(
    ({
        taskId,
        label,
        altLabel,
    }: {
        taskId?: TBacktestingTask['id'];
        label: string;
        altLabel?: string;
    }) =>
        isNil(taskId) ? (
            <>{altLabel ?? label}</>
        ) : (
            <div>
                <Tag className={cnTabTag} color="blue">
                    T{taskId}
                </Tag>
                {label}
            </div>
        ),
);

const RunTitle = memo(
    ({
        runId,
        label,
        altLabel,
    }: {
        runId?: TBacktestingRun['btRunNo'];
        label: string;
        altLabel?: string;
    }) =>
        isNil(runId) ? (
            <>{altLabel ?? label}</>
        ) : (
            <div>
                <Tag className={cnTabTag} color="purple">
                    R{runId}
                </Tag>
                {label}
            </div>
        ),
);

function isBacktestingTaskConfig(config: unknown): config is { task: TFormBacktestingTask } {
    if (isNil(config)) {
        return false;
    }

    return isObject(config) && 'task' in config && isObject(config.task);
}

function isUrlFrameConfig(config: unknown): config is { url: string; name?: string } {
    if (isNil(config)) {
        return false;
    }

    return isObject(config) && 'url' in config && isString(config.url) && !isEmpty(config.url);
}

function isExtendedWithBacktestingRunId(
    config: unknown,
): config is { meta: { runId: TBacktestingRun['btRunNo'] } } {
    if (isNil(config)) {
        return false;
    }

    return (
        isObject(config) &&
        'meta' in config &&
        isObject(config.meta) &&
        'runId' in config.meta &&
        !isNil(config.meta.runId)
    );
}
