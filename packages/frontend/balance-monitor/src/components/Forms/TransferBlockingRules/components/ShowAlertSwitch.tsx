import {
    AddTransferBlockingRuleTabProps,
    EAddTransferBlockingRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-transfer-blocking-rule/add-transfer-bloking-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSwitch } from '@frontend/common/src/components/Formik/components/FormikSwitch';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import { memo } from 'react';

import { cnNoWrapText } from '../../view.css';
import { cnAlert } from '../view.css';

export const ShowAlertSwitch = memo(
    ({
        className,
        classNameNested,
    }: TWithClassname & {
        classNameNested: string;
    }) => {
        return (
            <FormikForm.Item className={className} name="showAlert">
                <div className={classNameNested}>
                    <span className={cn(cnNoWrapText, cnAlert)}>Alert</span>
                    <FormikSwitch
                        {...AddTransferBlockingRuleTabProps[
                            EAddTransferBlockingRuleTabSelectors.AlertSwitch
                        ]}
                        name="showAlert"
                        checkedChildren="Show"
                        unCheckedChildren="Hide"
                    />
                </div>
            </FormikForm.Item>
        );
    },
);
