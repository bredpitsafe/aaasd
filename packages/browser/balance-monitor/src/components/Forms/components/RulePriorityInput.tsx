import {
    CommonRuleTabProps,
    ECommonRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';
import { FormikForm, FormikInputNumber } from '@frontend/common/src/components/Formik';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo } from 'react';

import { cnLabelNoVerticalSpace, cnNoWrapText } from '../view.css';

export const RulePriorityInput = memo(({ className }: TWithClassname) => (
    <FormikForm.Item className={className} name="rulePriority">
        <div className={cnLabelNoVerticalSpace}>
            <span className={cnNoWrapText}>Rule priority</span>
            <FormikInputNumber
                {...CommonRuleTabProps[ECommonRuleTabSelectors.RulePriorityInput]}
                name="rulePriority"
                min={0}
            />
        </div>
    </FormikForm.Item>
));
