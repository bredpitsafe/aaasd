import type { Milliseconds } from '@common/types';
import { generateTraceId } from '@common/utils';
import { validateBySchema } from '@frontend/common/src/components/Formik/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ECommonComponents, ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { useDebouncedLastResponse } from '@frontend/common/src/utils/React/useDebouncedLastResponse';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import type { FormikErrors } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { EMPTY, first, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import type {
    TFormBacktestingTask,
    TValidFormBacktestingTask,
} from '../../components/Forms/FormCreateBacktestingTask/defs';
import { CREATE_SCHEMA } from '../../components/Forms/FormCreateBacktestingTask/defs';
import {
    convertFormBacktestingValueToTask,
    convertFormBacktestingValueToValidationTask,
    toValidFormBacktestingTask,
} from '../../components/Forms/FormCreateBacktestingTask/utils';
import { FormCreateBacktestingTask } from '../../components/Forms/FormCreateBacktestingTask/view';
import { EBacktestingRoute } from '../../defs/router';
import { ModuleCreateAndStartBacktestingTask } from '../../modules/actions/ModuleCreateAndStartBacktestingTask';
import { ModuleValidateBacktestingTask } from '../../modules/actions/ModuleValidateBacktestingTask';
import { ModuleBacktestingRouter } from '../../modules/router/module';
import { convertTemplateErrors2FormikErrors } from './utils';

type TConnectedCreateTaskProps = TWithClassname & {
    task?: TFormBacktestingTask;
};

const DEBOUNCE_INTERVAL = 500 as Milliseconds;

export function WidgetCreateTask(props: TConnectedCreateTaskProps) {
    const traceId = useTraceId();
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const { getSocket$ } = useModule(ModuleSocketList);
    const { navigate } = useModule(ModuleBacktestingRouter);
    const { deleteTab } = useModule(ModuleLayouts);
    const validateBacktestingTask = useModule(ModuleValidateBacktestingTask);
    const createAndStartBacktestingTask = useModule(ModuleCreateAndStartBacktestingTask);

    const currentSocketName = useSyncObservable(currentSocketName$);
    const stage = useSyncObservable(currentSocketName$);

    const [cbCreateTask] = useNotifiedObservableFunction(
        (
            task: TValidFormBacktestingTask,
        ): Observable<undefined | FormikErrors<TFormBacktestingTask>> => {
            if (isNil(stage) || isNil(currentSocketName) || isNil(task.socketName)) {
                return of(undefined);
            }

            return getSocket$(task.socketName).pipe(
                first(),
                switchMap((target) =>
                    createAndStartBacktestingTask(
                        {
                            target,
                            ...convertFormBacktestingValueToTask(task),
                        },
                        { traceId },
                    ),
                ),
                mapValueDescriptor(
                    ({
                        value: backtestingTaskIdOrErrors,
                    }): undefined | FormikErrors<TFormBacktestingTask> => {
                        if (Array.isArray(backtestingTaskIdOrErrors)) {
                            const errors = convertTemplateErrors2FormikErrors(
                                task,
                                backtestingTaskIdOrErrors,
                            );

                            return errors !== true ? errors : undefined;
                        }

                        deleteTab(ECommonComponents.AddTask);

                        if (currentSocketName === task.socketName) {
                            void navigate(EBacktestingRoute.Task, {
                                socket: stage,
                                backtestingTaskId: backtestingTaskIdOrErrors,
                            });
                        }

                        return undefined;
                    },
                ),
            );
        },
        {
            getNotifyTitle: () => ({
                loading: `Create Backtesting Task`,
                success: `Backtesting Task created successfully`,
            }),
        },
    );

    const [validateTask] = useNotifiedObservableFunction(
        (
            task: TValidFormBacktestingTask,
        ): Observable<TValueDescriptor2<FormikErrors<TValidFormBacktestingTask> | true>> => {
            if (isNil(stage) || isNil(currentSocketName) || isNil(task.socketName)) {
                return EMPTY;
            }

            const traceId = generateTraceId();
            return getSocket$(task.socketName).pipe(
                first(),
                switchMap((target) =>
                    validateBacktestingTask(
                        {
                            target,
                            ...convertFormBacktestingValueToValidationTask(task),
                        },
                        { traceId, enableRetries: false },
                    ),
                ),
                mapValueDescriptor(({ value: errors }) => {
                    return createSyncedValueDescriptor(
                        convertTemplateErrors2FormikErrors(task, errors),
                    );
                }),
            );
        },
    );

    const validationBuilder$ = useFunction((task: TValidFormBacktestingTask) => {
        return validateTask(task)
            .then((value) => value ?? (true as const))
            .catch(() => true as const);
    });

    const cbValidateTask = useDebouncedLastResponse(validationBuilder$, DEBOUNCE_INTERVAL);

    const { className } = props;

    // Use deep comparison effect because `task` object comes here from a layout config,
    // which can change at any time. When it does (e.g. user changes form width)
    // `task` prop will appear to be an entirely new object, while being exactly the same data-wise.
    const task = useDeepEqualProp(props.task ?? EMPTY_OBJECT);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const validateBoth = useFunction(async (values: TFormBacktestingTask) => {
        const schemaValidationResult = await validateBySchema(values, CREATE_SCHEMA);

        if (schemaValidationResult === true && !isNil(cbValidateTask)) {
            return cbValidateTask(toValidFormBacktestingTask(values));
        }

        return schemaValidationResult;
    });

    // This is because Formik uses last validation result, even if it was not last call
    const cbValidate = useDebouncedLastResponse(validateBoth);

    if (isNil(currentSocketName)) {
        return null;
    }

    return (
        <FormCreateBacktestingTask
            className={className}
            task={task}
            socketName={currentSocketName}
            onSubmit={cbCreateTask}
            onValidate={cbValidate}
            timeZone={timeZone}
        />
    );
}
