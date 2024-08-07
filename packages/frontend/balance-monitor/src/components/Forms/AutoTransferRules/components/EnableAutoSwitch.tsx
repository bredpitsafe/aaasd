import {
    AddAutoTransferRuleTabProps,
    EAddAutoTransferRuleSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-auto-transfer-rule/add-auto-transfer-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSwitch } from '@frontend/common/src/components/Formik/components/FormikSwitch';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo } from 'react';

import { cnNoWrapText } from '../../view.css';

export const EnableAutoSwitch = memo(
    ({
        className,
        classNameNested,
    }: TWithClassname & {
        classNameNested: string;
    }) => {
        return (
            <FormikForm.Item className={className} name="enableAuto">
                <div className={classNameNested}>
                    <span className={cnNoWrapText}>Auto Transfer</span>
                    <FormikSwitch
                        {...AddAutoTransferRuleTabProps[
                            EAddAutoTransferRuleSelectors.AutoTransferSwitch
                        ]}
                        name="enableAuto"
                        checkedChildren="Enabled"
                        unCheckedChildren="Disabled"
                    />
                </div>
            </FormikForm.Item>
        );
    },
);
