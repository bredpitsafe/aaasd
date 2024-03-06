import {
    AddAmountLimitsRuleTabProps,
    EAddAmountLimitsRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSwitch } from '@frontend/common/src/components/Formik/components/FormikSwitch';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo } from 'react';

import { cnLabelNoVerticalSpace, cnNoWrapText } from '../view.css';

export const DoNotOverrideSwitch = memo(({ className }: TWithClassname) => {
    return (
        <FormikForm.Item className={className} name="doNotOverride">
            <div className={cnLabelNoVerticalSpace}>
                <span className={cnNoWrapText}>Do not override</span>
                <FormikSwitch
                    {...AddAmountLimitsRuleTabProps[
                        EAddAmountLimitsRuleTabSelectors.DoNotOverrideSwitch
                    ]}
                    name="doNotOverride"
                    checkedChildren="On"
                    unCheckedChildren="Off"
                />
            </div>
        </FormikForm.Item>
    );
});
