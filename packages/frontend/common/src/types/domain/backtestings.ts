import type { ISO } from '@common/types';

import type { TStructurallyCloneableObject } from '../serialization';
import type { TTextFile } from './textFile';

export type TBacktestingTaskCreateParams = Pick<TBacktestingTaskConfigs, 'variablesTemplate'> &
    Pick<TBacktestingTask, 'name' | 'description' | 'simulationData' | 'scoreIndicator'> & {
        backtestConfigTemplate: TBacktestingTaskConfigs['configTemplate'];
        robots: Pick<TBacktestingTaskRobot, 'name' | 'kind' | 'configTemplate' | 'attachments'>[];
    };

export type TBacktestingTaskId = number;
export type TBacktestingTask = {
    id: TBacktestingTaskId;
    name: string;
    description: string;
    totalBtRuns: number;
    platformTime: ISO;
    simulationData: {
        startTime: ISO;
        endTime: ISO;
    };
    status: EBacktestingTaskStatus;
    reason: string;
    user: null | string;
    runsStatus: null | [EBacktestingRunStatus, number][];
    minBtRunNo: null | number;
    maxBtRunNo: null | number;
    scoreIndicator: null | string;
};

export type TBacktestingTaskRobot = {
    name: string;
    kind: string;
    state: undefined | string;
    configTemplate: string;
    attachments?: null | TTextFile[];
};

export type TBacktestingTaskConfigs = {
    taskId: TBacktestingTaskId;
    robots: TBacktestingTaskRobot[];
    variablesTemplate: string;
    configTemplate: string;
};

export enum EBacktestingTaskStatus {
    Queued = 'Queued',
    Running = 'Running',
    Paused = 'Paused',
    Canceled = 'Canceled',
    Archived = 'Archived',
    Finished = 'Finished',
}

export enum EBacktestingRunStatus {
    Initializing = 'Initializing',
    Running = 'Running',
    Paused = 'Paused',
    Succeed = 'Succeed',
    Stopped = 'Stopped',
    Failed = 'Failed',
    WaitingForData = 'WaitingForData',
}

export type TBacktestingRunId = number;

export type TBacktestingRun = {
    btRunNo: TBacktestingRunId;
    taskId: number;
    group: string;
    status: EBacktestingRunStatus;
    statusReason: string;
    speed: number;
    realStartTime: ISO;
    realCurrentTime: ISO;
    simulationTime: ISO;
    simulationStartTime: ISO | null;
    simulationEndTime: ISO | null;
    variables: TStructurallyCloneableObject | null;
};

export type TValidationTemplateErrorKindTaskConfig = 'taskConfig';
export type TValidationTemplateErrorKindRobotConfig = {
    robotConfig: {
        name: string;
        kind: string;
    };
};

export type TValidationTemplateErrorKind =
    | TValidationTemplateErrorKindTaskConfig
    | TValidationTemplateErrorKindRobotConfig;

export type TValidationTemplateError = {
    error: string;
    variables: Record<string, string | TStructurallyCloneableObject> | null;
    kind: TValidationTemplateErrorKind;
};

export type TValidationTemplateErrors =
    | {
          template: TValidationTemplateError[];
      }
    | { variables: Record<string, string | TStructurallyCloneableObject> | null };
