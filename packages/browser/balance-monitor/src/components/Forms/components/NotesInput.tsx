import {
    CommonRuleTabProps,
    ECommonRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo } from 'react';

export const NotesInput = memo(({ className }: TWithClassname) => {
    return (
        <FormikForm.Item className={className} name="note" label="Notes">
            <FormikInput.TextArea
                {...CommonRuleTabProps[ECommonRuleTabSelectors.NotesInput]}
                name="note"
                allowClear
            />
        </FormikForm.Item>
    );
});
