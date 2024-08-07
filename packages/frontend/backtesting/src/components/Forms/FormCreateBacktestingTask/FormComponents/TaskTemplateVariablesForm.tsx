import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikConfigEditor } from '@frontend/common/src/components/Formik/components/FormikConfigEditor';
import { memo } from 'react';

import type { TFormCreateBacktestingTaskProps } from '../defs';
import { EFieldName } from '../defs';
import { cnConfigEditor, cnTemplateVariablesItem } from '../view.css';

type TTaskTemplateVariablesFormProps = Pick<TFormCreateBacktestingTaskProps, 'readonly'>;

export const TaskTemplateVariablesForm = memo((props: TTaskTemplateVariablesFormProps) => (
    <FormikForm.Item
        {...createTestProps(EAddTaskTabSelectors.TemplateVariablesInput)}
        name={EFieldName.VariablesTemplate}
        className={cnTemplateVariablesItem}
    >
        <FormikConfigEditor
            language={EConfigEditorLanguages.json}
            className={cnConfigEditor}
            name={EFieldName.VariablesTemplate}
            readOnly={props.readonly}
        />
    </FormikForm.Item>
));
