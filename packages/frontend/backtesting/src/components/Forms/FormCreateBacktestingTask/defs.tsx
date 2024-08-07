import type { Milliseconds, TimeZone } from '@common/types';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type {
    EBacktestingTaskStatus,
    TBacktestingTask,
    TBacktestingTaskConfigs,
    TBacktestingTaskRobot,
} from '@frontend/common/src/types/domain/backtestings';
import type { TSocketName } from '@frontend/common/src/types/domain/sockets';
import type { FormikErrors } from 'formik/dist/types';
import * as Yup from 'yup';
import type Reference from 'yup/lib/Reference';

type TFormBacktestingTaskRobot = TBacktestingTaskConfigs['robots'][0];

export type TFormBacktestingTask = Partial<
    Pick<TBacktestingTask, 'id' | 'name' | 'description'> &
        Pick<TBacktestingTaskConfigs, 'variablesTemplate' | 'configTemplate'> & {
            scoreIndicatorsList: string[];
            robots: Pick<
                TBacktestingTaskRobot,
                'name' | 'kind' | 'configTemplate' | 'attachments' | 'state'
            >[];
            simulationData: {
                startTime: Milliseconds;
                endTime: Milliseconds;
            };
            socketName: TSocketName;
        }
>;
export type TValidFormBacktestingTask = Required<TFormBacktestingTask>;

export const DEFAULT_ROBOT: TFormBacktestingTaskRobot = {
    name: '',
    kind: '',
    state: undefined,
    configTemplate: '',
};

export const CREATE_SCHEMA = Yup.object().shape({
    name: Yup.string().required('Name is a required field'),
    description: Yup.string().required('Description is a required field'),
    runScore: Yup.string().nullable(true).optional(),
    simulationData: Yup.object().shape({
        startTime: Yup.number()
            .required('Start Time is required field')
            .lessThan(
                Yup.ref('endTime') as Reference<number>,
                'Start Time should be less then End Time',
            ),
        endTime: Yup.number()
            .required('End Time is required field')
            .moreThan(
                Yup.ref('startTime') as Reference<number>,
                'End Time should be greater then Start Time',
            ),
    }),
    variablesTemplate: Yup.string().nullable(true).optional(),
    configTemplate: Yup.string().required('Config template is a required field'),
    robots: Yup.array()
        .of(
            Yup.object().shape({
                name: Yup.string().required('Robot Name is required field'),
                kind: Yup.string().required('Robot Kind is required field'),
                state: Yup.string().nullable(),
                configTemplate: Yup.string().required('Robot Config is required field'),
            }),
        )
        .required(),
});

export const UPDATE_SCHEMA = Yup.object().shape({
    name: Yup.string().required('Name is a required field'),
    description: Yup.string().required('Description is a required field'),
    runScore: Yup.string().nullable(true).optional(),
});

export enum EFieldName {
    Name = 'name',
    Description = 'description',
    ScoreIndicatorsList = 'scoreIndicatorsList',
    SimulationData = 'simulationData',
    StartTime = 'simulationData.startTime',
    EndTime = 'simulationData.endTime',
    VariablesTemplate = 'variablesTemplate',
    BacktestingTemplate = 'configTemplate',
    Robots = 'robots',
}

export enum EFieldRobotName {
    Name = 'name',
    Kind = 'kind',
    State = 'state',
    Config = 'configTemplate',
    Attachments = 'attachments',
}

export enum ETabName {
    TemplateVariables = 'Template variables',
    Common = 'Common',
    RobotState = 'State',
    RobotConfig = 'Config',
    RobotAttachments = 'Attachments',
}

export const DEFAULT_ROBOT_NAME = '';

type TErrorsOrVoid = undefined | FormikErrors<TFormBacktestingTask>;

export type TFormCreateBacktestingTaskProps = TWithClassname & {
    task?: TFormBacktestingTask;
    taskStatus?: EBacktestingTaskStatus;
    readonly?: boolean;
    socketName?: TSocketName;
    socketNames?: TSocketName[];
    timeZone: TimeZone;
    onSubmit?: (data: TValidFormBacktestingTask) => TErrorsOrVoid | Promise<TErrorsOrVoid>;
    onValidate?: (
        values: TFormBacktestingTask,
    ) => Promise<true | FormikErrors<TFormBacktestingTask>>;
};
