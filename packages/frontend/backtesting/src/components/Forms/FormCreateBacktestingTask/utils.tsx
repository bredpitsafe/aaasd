import { iso2milliseconds, milliseconds2iso } from '@common/utils';
import {
    EAddTaskTabProps,
    EAddTaskTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import type {
    TBacktestingTask,
    TBacktestingTaskConfigs,
    TBacktestingTaskCreateParams,
} from '@frontend/common/src/types/domain/backtestings';
import type { FormikErrors } from 'formik/dist/types';
import { isArray, isEmpty, isNil, omit, pick } from 'lodash-es';

import { indicatorsListToIndicator, indicatorToIndicatorsList } from '../../../utils/indicators';
import type { EFieldRobotName, TFormBacktestingTask, TValidFormBacktestingTask } from './defs';
import { DEFAULT_ROBOT_NAME, EFieldName, ETabName } from './defs';
import { cnTabNameWithError } from './view.css';

export function getFormTabName(name: ETabName, errors?: FormikErrors<TFormBacktestingTask>) {
    let hasErrors = false;

    if (!isEmpty(errors)) {
        switch (name) {
            case ETabName.Common:
                hasErrors =
                    !isNil(errors[EFieldName.Name]) ||
                    !isNil(errors[EFieldName.Description]) ||
                    !isNil(errors[EFieldName.SimulationData]) ||
                    !isNil(errors[EFieldName.BacktestingTemplate]);
                break;
            case ETabName.TemplateVariables:
                hasErrors = !isNil(errors[EFieldName.VariablesTemplate]);
                break;
        }
    }

    return hasErrors ? <div className={cnTabNameWithError}>{name}*</div> : name;
}

export function getRobotKey() {
    return String(Math.random());
}

export function getRobotTabName(
    name: string,
    index: number,
    errors?: FormikErrors<TFormBacktestingTask>,
) {
    const robotsErrors = errors?.[EFieldName.Robots];
    const withError =
        isArray(robotsErrors) && robotsErrors.length >= index && robotsErrors[index] !== undefined;

    return withError ? <div className={cnTabNameWithError}>{name ?? ''}*</div> : name ?? '';
}

export function getRobotNestedTabName(
    name: ETabName,
    index: number,
    field: EFieldRobotName,
    errors?: FormikErrors<TFormBacktestingTask>,
) {
    const robotsErrors = errors?.[EFieldName.Robots];
    const withError =
        isArray(robotsErrors) &&
        robotsErrors.length >= index &&
        robotsErrors[index] !== undefined &&
        robotsErrors[index][field] !== undefined;

    return withError ? <div className={cnTabNameWithError}>{name}*</div> : name;
}

export function getRobotTab(
    key: string = getRobotKey(),
    index = 0,
    name: string = DEFAULT_ROBOT_NAME,
) {
    return {
        key,
        label: (
            <span {...EAddTaskTabProps[EAddTaskTabSelectors.AddRobotButton]}>
                {getRobotTabName(name, index)}
            </span>
        ),
        closable: true,
    };
}

export function getFormikItemName(base: string, index: number, field: string): string {
    return `${base}[${index}].${field}`;
}

export function compileFormDataFromTaskAndConfigs(
    task: TBacktestingTask,
    configs: TBacktestingTaskConfigs,
): Omit<TFormBacktestingTask, 'socketName'> {
    const { id, name, description, scoreIndicator } = task;

    return {
        id,
        name,
        description,
        robots: configs.robots.map((robot) =>
            pick(robot, 'name', 'kind', 'configTemplate', 'attachments', 'state'),
        ),
        variablesTemplate: configs.variablesTemplate,
        configTemplate: configs.configTemplate,
        simulationData: {
            startTime: iso2milliseconds(task.simulationData.startTime),
            endTime: iso2milliseconds(task.simulationData.endTime),
        },
        scoreIndicatorsList: indicatorToIndicatorsList(scoreIndicator),
    };
}

export function convertFormBacktestingValueToTask(
    task: TValidFormBacktestingTask,
): TBacktestingTaskCreateParams {
    const { scoreIndicatorsList, ...restTaskProps } = task;

    return {
        ...restTaskProps,
        backtestConfigTemplate: task.configTemplate,
        simulationData: {
            startTime: milliseconds2iso(task.simulationData.startTime),
            endTime: milliseconds2iso(task.simulationData.endTime),
        },
        scoreIndicator: indicatorsListToIndicator(scoreIndicatorsList),
    };
}

export function convertFormBacktestingValueToValidationTask(
    task: TValidFormBacktestingTask,
): Omit<TBacktestingTaskCreateParams, 'simulationData' | 'taskId'> {
    return omit(convertFormBacktestingValueToTask(task), 'simulationData');
}

export function toValidFormBacktestingTask(task: TFormBacktestingTask): TValidFormBacktestingTask {
    return {
        ...task,
        variablesTemplate: task.variablesTemplate || null,
    } as TValidFormBacktestingTask;
}
