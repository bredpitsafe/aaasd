import type { TimeZone } from '@common/types';
import {
    AddTransferBlockingRuleTabProps,
    EAddTransferBlockingRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-transfer-blocking-rule/add-transfer-bloking-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikDatePicker } from '@frontend/common/src/components/Formik/components/FormikDataPicker';
import { FormikSwitch } from '@frontend/common/src/components/Formik/components/FormikSwitch';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { FormikProps } from 'formik';
import { memo } from 'react';

import { cnLabelNoVerticalSpace, cnNoWrapText } from '../../view.css';
import type { TTransferBlockingRuleFormData } from '../defs';
import { cnEndPeriodDate } from '../view.css';

export const StartPeriodSelector = memo(
    ({
        className,
        formik: { values },
        timeZone,
    }: TWithClassname & {
        formik: FormikProps<Partial<TTransferBlockingRuleFormData>>;
        timeZone: TimeZone;
    }) => {
        return (
            <div className={className}>
                <FormikForm.Item name="startImmediately">
                    <div className={cnLabelNoVerticalSpace}>
                        <span className={cnNoWrapText}>Start time</span>
                        <FormikSwitch
                            {...AddTransferBlockingRuleTabProps[
                                EAddTransferBlockingRuleTabSelectors.StartTimeSwitch
                            ]}
                            name="startImmediately"
                            checkedChildren="Now"
                            unCheckedChildren="Custom"
                        />
                    </div>
                </FormikForm.Item>
                <FormikForm.Item name="startTime">
                    <div className={cn(cnLabelNoVerticalSpace, cnEndPeriodDate)}>
                        <FormikDatePicker
                            {...AddTransferBlockingRuleTabProps[
                                EAddTransferBlockingRuleTabSelectors.StartTimeInput
                            ]}
                            timeZone={timeZone}
                            name="startTime"
                            showTime
                            showNow
                            allowClear
                            disabled={values.startImmediately}
                        />
                    </div>
                </FormikForm.Item>
            </div>
        );
    },
);
