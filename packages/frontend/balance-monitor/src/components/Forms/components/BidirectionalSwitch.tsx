import {
    CommonRuleTabProps,
    ECommonRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/common-rules/common-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSwitch } from '@frontend/common/src/components/Formik/components/FormikSwitch';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { memo } from 'react';

import { cnNoWrapText } from '../view.css';

export const BidirectionalSwitch = memo(
    ({
        className,
        classNameNested,
    }: TWithClassname & {
        classNameNested: string;
    }) => {
        return (
            <FormikForm.Item className={className} name="withOpposite">
                <div className={classNameNested}>
                    <span className={cnNoWrapText}>Both directions</span>
                    <FormikSwitch
                        {...CommonRuleTabProps[ECommonRuleTabSelectors.BothDirectionsSwitch]}
                        name="withOpposite"
                        checkedChildren="On"
                        unCheckedChildren="Off"
                    />
                </div>
            </FormikForm.Item>
        );
    },
);
