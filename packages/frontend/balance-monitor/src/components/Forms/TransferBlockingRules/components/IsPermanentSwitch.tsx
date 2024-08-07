import {
    AddTransferBlockingRuleTabProps,
    EAddTransferBlockingRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-transfer-blocking-rule/add-transfer-bloking-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSwitch } from '@frontend/common/src/components/Formik/components/FormikSwitch';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo } from 'react';

import { cnLabelNoVerticalSpace, cnNoWrapText } from '../../view.css';

export const IsPermanentSwitch = memo(({ className }: TWithClassname) => {
    return (
        <FormikForm.Item className={className} name="isPermanent">
            <div className={cnLabelNoVerticalSpace}>
                <span className={cnNoWrapText}>Permanent</span>
                <FormikSwitch
                    {...AddTransferBlockingRuleTabProps[
                        EAddTransferBlockingRuleTabSelectors.PermanentSwitch
                    ]}
                    name="isPermanent"
                    checkedChildren="On"
                    unCheckedChildren="Off"
                />
            </div>
        </FormikForm.Item>
    );
});
