import { FormikForm } from '@frontend/common/src/components/Formik';
import type { TabsProps } from '@frontend/common/src/components/Tabs';
import { arrayWithoutAt } from '@frontend/common/src/utils/arrayWithoutAt';
import { EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik/dist/types';
import { isNil, isObject } from 'lodash-es';
import { memo, useEffect, useMemo, useState } from 'react';

import type { TFormBacktestingTask, TFormCreateBacktestingTaskProps } from './defs';
import { ETabName } from './defs';
import { TaskConfigsForm } from './FormComponents/TaskConfigsForm';
import { getRobotKey, getRobotTab, toValidFormBacktestingTask } from './utils';
import { cnRoot } from './view.css';

dayjs.extend(utc);

const DEFAULT_ROBOT_TABS: TabsProps['items'] = [];

export const FormCreateBacktestingTask = memo((props: TFormCreateBacktestingTaskProps) => {
    const seedRobotTabs: TabsProps['items'] = useMemo(() => {
        return (
            props.task?.robots?.map((r, i) => getRobotTab(getRobotKey(), i)) ?? DEFAULT_ROBOT_TABS
        );
    }, [props.task?.robots]);

    const [activeTab, setActiveTab] = useState<string>(ETabName.Common);
    const [robotTabs, setRobotTabs] = useState(seedRobotTabs);
    const addTab = useFunction(() => {
        const key = getRobotKey();

        setActiveTab(key);
        setRobotTabs((robots) => robots?.concat(getRobotTab(key, robots.length)));
    });
    const removeTab = useFunction((key: string): number => {
        const index = robotTabs?.findIndex((r) => r.key === key);
        if (!isNil(index) && index !== -1) {
            setRobotTabs(arrayWithoutAt(robotTabs!, index));
        }

        return index!;
    });

    const handleSubmit = useFunction(
        async (v: TFormBacktestingTask, formikHelpers: FormikHelpers<TFormBacktestingTask>) => {
            if (isNil(props.onSubmit)) {
                return;
            }

            const formikErrors = await props.onSubmit(toValidFormBacktestingTask(v));
            if (isObject(formikErrors)) {
                formikHelpers.setErrors(formikErrors);
            }
        },
    );

    useEffect(() => {
        setRobotTabs(seedRobotTabs);
        setActiveTab(ETabName.Common);
    }, [seedRobotTabs]);

    const initialValues = useMemo<TFormBacktestingTask>(
        () => ({
            ...(props.task ?? EMPTY_OBJECT),
            socketName: props.socketName,
        }),
        [props.task, props.socketName],
    );

    return (
        <Formik<TFormBacktestingTask>
            enableReinitialize
            initialValues={initialValues}
            validate={props.onValidate}
            onSubmit={handleSubmit}
            validateOnMount={false}
            validateOnBlur={false}
        >
            {(formik) => (
                <FormikForm className={cn(cnRoot, props.className)}>
                    <TaskConfigsForm
                        formik={formik}
                        taskStatus={props.taskStatus}
                        activeTab={activeTab}
                        robotTabs={robotTabs}
                        readonly={props.readonly}
                        className={props.className}
                        addTab={addTab}
                        removeTab={removeTab}
                        setActiveTab={setActiveTab}
                        socketName={props.socketName}
                        onSubmit={props.onSubmit}
                        timeZone={props.timeZone}
                    />
                </FormikForm>
            )}
        </Formik>
    );
});
