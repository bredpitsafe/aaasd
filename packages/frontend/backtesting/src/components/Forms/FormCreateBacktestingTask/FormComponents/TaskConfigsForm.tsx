import { PlusOutlined } from '@ant-design/icons';
import {
    EAddTaskTabProps,
    EAddTaskTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import type { TabsProps } from '@frontend/common/src/components/Tabs';
import { Tabs } from '@frontend/common/src/components/Tabs';
import { useModule } from '@frontend/common/src/di/react';
import { arrayWithoutAt } from '@frontend/common/src/utils/arrayWithoutAt';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { FormikProps } from 'formik';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';

import { ModuleFormDraft } from '../../../../modules/formDraft';
import type { TFormBacktestingTask, TFormCreateBacktestingTaskProps } from '../defs';
import { DEFAULT_ROBOT, EFieldName, ETabName } from '../defs';
import { getFormTabName, getRobotTabName } from '../utils';
import { cnTabs } from '../view.css';
import { RobotTabForm } from './RobotTabForm';
import { TaskActionButtons } from './TaskActionButtons';
import { TaskCommonTabForm } from './TaskCommonTabForm';
import { TaskSubmitButton } from './TaskSubmitButton';
import { TaskTemplateVariablesForm } from './TaskTemplateVariablesForm';

type TTaskConfigsFormProps = Pick<
    TFormCreateBacktestingTaskProps,
    'className' | 'readonly' | 'onSubmit' | 'taskStatus' | 'timeZone' | 'socketName'
> & {
    formik: FormikProps<TFormBacktestingTask>;
    activeTab: string | undefined;
    robotTabs: TabsProps['items'];
    addTab: () => void;
    removeTab: (key: string) => number;
    setActiveTab: (key: string) => void;
};

export function TaskConfigsForm(props: TTaskConfigsFormProps): ReactElement | null {
    const { formik, activeTab, robotTabs, readonly, addTab, removeTab, setActiveTab, taskStatus } =
        props;

    const [robotItems, handleEditRobotTabs] = useRobotsTabs(
        formik,
        robotTabs,
        addTab,
        removeTab,
        readonly,
    );

    const { setFormDraftsCount } = useModule(ModuleFormDraft);

    useEffect(() => {
        if (formik.dirty) setFormDraftsCount((prev) => prev + 1);
        return () => setFormDraftsCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, [formik.dirty, setFormDraftsCount]);

    const items: TabsProps['items'] = useMemo(
        () => [
            {
                key: ETabName.Common,
                label: (
                    <span {...EAddTaskTabProps[EAddTaskTabSelectors.CommonButton]}>
                        {getFormTabName(ETabName.Common, formik.errors)}
                    </span>
                ),
                closable: false,
                children: (
                    <TaskCommonTabForm
                        formik={formik}
                        readonly={props.readonly}
                        timeZone={props.timeZone}
                        onSubmit={props.onSubmit}
                    />
                ),
            },
            {
                key: ETabName.TemplateVariables,
                label: (
                    <span {...EAddTaskTabProps[EAddTaskTabSelectors.TemplateVariablesButton]}>
                        {getFormTabName(ETabName.TemplateVariables, formik.errors)}
                    </span>
                ),
                closable: false,
                children: <TaskTemplateVariablesForm readonly={props.readonly} />,
            },
            ...robotItems!,
        ],
        [formik, props.readonly, props.timeZone, props.onSubmit, robotItems],
    );

    return (
        <Tabs
            type={props.readonly ? 'card' : 'editable-card'}
            activeKey={activeTab}
            onChange={setActiveTab}
            onEdit={handleEditRobotTabs}
            addIcon={<PlusOutlined {...EAddTaskTabProps[EAddTaskTabSelectors.AddRobotButton]} />}
            className={cnTabs}
            size="small"
            items={items}
            destroyInactiveTabPane
            tabBarExtraContent={
                props.readonly
                    ? !isNil(formik.values.id) && (
                          <TaskActionButtons id={formik.values.id} status={taskStatus} />
                      )
                    : props.onSubmit && (
                          <TaskSubmitButton
                              isSubmitting={formik.isSubmitting}
                              errors={formik.errors}
                              isValidating={formik.isValidating}
                              onSubmit={formik.submitForm}
                          />
                      )
            }
        />
    );
}

function useRobotsTabs(
    formik: FormikProps<TFormBacktestingTask>,
    robotTabs: TabsProps['items'],
    addTab: () => void,
    removeTab: (key: string) => number,
    readonly?: boolean,
): [
    TabsProps['items'],
    (key: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => void,
] {
    const robots = formik.getFieldMeta(EFieldName.Robots).value as TFormBacktestingTask['robots'];

    const addRobot = useFunction(() => {
        addTab();
        formik.setFieldValue(
            EFieldName.Robots,
            robots === undefined ? [DEFAULT_ROBOT] : robots.concat(DEFAULT_ROBOT),
            true,
        );
    });

    const removeRobot = useFunction((key: string) => {
        const index = removeTab(key);

        if (robots !== undefined && index !== -1) {
            formik.setFieldValue(EFieldName.Robots, arrayWithoutAt(robots, index), true);
        }
    });

    const handleEditRobotTabs = useFunction(
        (key: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
            action === 'add' && addRobot();
            action === 'remove' && removeRobot(key as string);
        },
    );

    const robotItems: TabsProps['items'] = useMemo(
        () =>
            isNil(robotTabs)
                ? EMPTY_ARRAY
                : robotTabs.map((tab, index) => {
                      const robot = robots?.[index];
                      const label = isNil(robot)
                          ? tab.label
                          : getRobotTabName(robot.name, index, formik.errors);

                      return {
                          ...tab,
                          label,
                          children: (
                              <RobotTabForm
                                  index={index}
                                  readonly={readonly}
                                  errors={formik.errors}
                              />
                          ),
                      };
                  }),

        [formik.errors, readonly, robots, robotTabs],
    );

    return [robotItems, handleEditRobotTabs];
}
