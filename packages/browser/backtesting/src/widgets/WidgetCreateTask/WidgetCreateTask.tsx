import { validateBySchema } from '@frontend/common/src/components/Formik/utils';
import { useUtcTimeZoneInfo } from '@frontend/common/src/components/Settings/hooks/useUtcTimeZoneInfo';
import { useModule } from '@frontend/common/src/di/react';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp';
import { ECommonComponents, ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { Milliseconds } from '@frontend/common/src/types/time';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { useDebouncedLastResponse } from '@frontend/common/src/utils/React/useDebouncedLastResponse';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { extractSyncedValueFromValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import type { FormikErrors } from 'formik/dist/types';
import { isNil } from 'lodash-es';
import { EMPTY, firstValueFrom, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const { getSocket$ } = useModule(ModuleSocketList);
    const { navigate } = useModule(ModuleBacktestingRouter);
    const { deleteTab } = useModule(ModuleLayouts);
    const validateBacktestingTask = useModule(ModuleValidateBacktestingTask);
    const createAndStartBacktestingTask = useModule(ModuleCreateAndStartBacktestingTask);

    const currentSocketName = useSyncObservable(currentSocketName$);
    const stage = useSyncObservable(currentSocketName$);

    const cbCreateTask = useFunction(
        async (
            task: TValidFormBacktestingTask,
        ): Promise<FormikErrors<TFormBacktestingTask> | undefined> => {
            if (isNil(stage) || isNil(currentSocketName) || isNil(task.socketName)) {
                return;
            }

            const traceId = generateTraceId();
            const backtestingTaskIdOrErrors = await firstValueFrom(
                getSocket$(task.socketName).pipe(
                    switchMap((target) =>
                        createAndStartBacktestingTask(
                            {
                                target,
                                ...convertFormBacktestingValueToTask(task),
                            },
                            { traceId },
                        ),
                    ),
                    extractSyncedValueFromValueDescriptor(),
                ),
            );

            if (Array.isArray(backtestingTaskIdOrErrors)) {
                const errors = convertTemplateErrors2FormikErrors(task, backtestingTaskIdOrErrors);

                return errors !== true ? errors : undefined;
            }

            await deleteTab(ECommonComponents.AddTask);

            if (currentSocketName === task.socketName) {
                await navigate(EBacktestingRoute.Task, {
                    socket: stage,
                    backtestingTaskId: backtestingTaskIdOrErrors,
                });
            }
        },
    );

    const validationBuilder$ = useFunction(
        (
            task: TValidFormBacktestingTask,
        ): Observable<FormikErrors<TValidFormBacktestingTask> | true> => {
            if (isNil(stage) || isNil(currentSocketName) || isNil(task.socketName)) {
                return EMPTY;
            }

            const traceId = generateTraceId();
            return getSocket$(task.socketName).pipe(
                switchMap((target) =>
                    validateBacktestingTask(
                        {
                            target,
                            ...convertFormBacktestingValueToValidationTask(task),
                        },
                        { traceId },
                    ),
                ),
                extractSyncedValueFromValueDescriptor(),
                map((errors) => convertTemplateErrors2FormikErrors(task, errors)),
                catchError(
                    () => of(true) as Observable<FormikErrors<TValidFormBacktestingTask> | true>,
                ),
            );
        },
    );

    const cbValidateTask = useDebouncedLastResponse(validationBuilder$, DEBOUNCE_INTERVAL);

    const { className } = props;

    // Use deep comparison effect because `task` object comes here from a layout config,
    // which can change at any time. When it does (e.g. user changes form width)
    // `task` prop will appear to be an entirely new object, while being exactly the same data-wise.
    const task = useDeepEqualProp(props.task ?? EMPTY_OBJECT);

    const { timeZone } = useUtcTimeZoneInfo();

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
