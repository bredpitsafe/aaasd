import {
    EAddTaskTabProps,
    EAddTaskTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import { FilesManager } from '@frontend/common/src/components/FilesManager';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import { FormikConfigEditor } from '@frontend/common/src/components/Formik/components/FormikConfigEditor';
import type { TabsProps } from '@frontend/common/src/components/Tabs';
import { Tabs } from '@frontend/common/src/components/Tabs';
import type { TTextFile } from '@frontend/common/src/types/domain/textFile';
import cn from 'classnames';
import { useField } from 'formik';
import type { FormikErrors } from 'formik/dist/types';
import { memo, useMemo } from 'react';

import type { TFormBacktestingTask } from '../defs';
import { EFieldName, EFieldRobotName, ETabName } from '../defs';
import { getFormikItemName, getRobotNestedTabName } from '../utils';
import {
    cnConfigEditor,
    cnConfigEditorFormItem,
    cnConfigWithoutResizer,
    cnInlineFormItem,
    cnNameAndKind,
    cnTabs,
} from '../view.css';

type TRobotTabFormProps = {
    index: number;
    readonly?: boolean;
    errors?: FormikErrors<TFormBacktestingTask>;
};

export const RobotTabForm = memo((props: TRobotTabFormProps) => {
    const items: TabsProps['items'] = useSubTabsItems(props);

    return (
        <>
            <div className={cnNameAndKind}>
                <FormikForm.Item
                    className={cnInlineFormItem}
                    name={getFormikItemName(EFieldName.Robots, props.index, EFieldRobotName.Name)}
                    label="Name"
                    colon
                >
                    <FormikInput
                        {...EAddTaskTabProps[EAddTaskTabSelectors.NameRobotInput]}
                        name={getFormikItemName(
                            EFieldName.Robots,
                            props.index,
                            EFieldRobotName.Name,
                        )}
                        readOnly={props.readonly}
                    />
                </FormikForm.Item>
                <FormikForm.Item
                    className={cnInlineFormItem}
                    name={getFormikItemName(EFieldName.Robots, props.index, EFieldRobotName.Kind)}
                    label="Kind"
                >
                    <FormikInput
                        {...EAddTaskTabProps[EAddTaskTabSelectors.KindRobotInput]}
                        name={getFormikItemName(
                            EFieldName.Robots,
                            props.index,
                            EFieldRobotName.Kind,
                        )}
                        readOnly={props.readonly}
                    />
                </FormikForm.Item>
            </div>
            <Tabs className={cnTabs} type="card" size="small" items={items} />
        </>
    );
});

function useSubTabsItems(props: TRobotTabFormProps) {
    return useMemo(
        () => [
            {
                key: ETabName.RobotConfig,
                label: getRobotNestedTabName(
                    ETabName.RobotConfig,
                    props.index,
                    EFieldRobotName.Config,
                    props.errors,
                ),
                children: (
                    <FormikForm.Item
                        {...EAddTaskTabProps[EAddTaskTabSelectors.ConfigRobotInput]}
                        className={cnConfigEditorFormItem}
                        name={getFormikItemName(
                            EFieldName.Robots,
                            props.index,
                            EFieldRobotName.Config,
                        )}
                    >
                        <FormikConfigEditor
                            name={getFormikItemName(
                                EFieldName.Robots,
                                props.index,
                                EFieldRobotName.Config,
                            )}
                            readOnly={props.readonly}
                            language={EConfigEditorLanguages.xml}
                            className={cn(cnConfigEditor, cnConfigWithoutResizer)}
                        />
                    </FormikForm.Item>
                ),
            },
            {
                key: ETabName.RobotState,
                label: getRobotNestedTabName(
                    ETabName.RobotState,
                    props.index,
                    EFieldRobotName.State,
                    props.errors,
                ),
                children: (
                    <FormikForm.Item
                        {...EAddTaskTabProps[EAddTaskTabSelectors.StateRobotInput]}
                        className={cnConfigEditorFormItem}
                        name={getFormikItemName(
                            EFieldName.Robots,
                            props.index,
                            EFieldRobotName.State,
                        )}
                    >
                        <FormikConfigEditor
                            name={getFormikItemName(
                                EFieldName.Robots,
                                props.index,
                                EFieldRobotName.State,
                            )}
                            readOnly={props.readonly}
                            language={EConfigEditorLanguages.json}
                            className={cn(cnConfigEditor, cnConfigWithoutResizer)}
                        />
                    </FormikForm.Item>
                ),
            },
            {
                key: ETabName.RobotAttachments,
                label: getRobotNestedTabName(
                    ETabName.RobotAttachments,
                    props.index,
                    EFieldRobotName.Attachments,
                    props.errors,
                ),
                children: (
                    <FormikForm.Item
                        className={cnConfigEditorFormItem}
                        name={getFormikItemName(
                            EFieldName.Robots,
                            props.index,
                            EFieldRobotName.Attachments,
                        )}
                    >
                        <FormikFilesManager
                            name={getFormikItemName(
                                EFieldName.Robots,
                                props.index,
                                EFieldRobotName.Attachments,
                            )}
                            readonly={props.readonly}
                        />
                    </FormikForm.Item>
                ),
            },
        ],
        [props.errors, props.index, props.readonly],
    );
}

function FormikFilesManager({ name, readonly = false }: { name: string; readonly?: boolean }) {
    const [{ value }, , { setValue }] = useField<TTextFile[]>(name);
    return <FilesManager onChange={setValue} value={value} readonly={readonly} />;
}
