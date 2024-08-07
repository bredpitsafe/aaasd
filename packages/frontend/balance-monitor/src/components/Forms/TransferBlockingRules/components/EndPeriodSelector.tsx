import type { TimeZone } from '@common/types';
import {
    AddTransferBlockingRuleTabProps,
    EAddTransferBlockingRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-transfer-blocking-rule/add-transfer-bloking-rule.tab.selectors';
import { FormikForm, FormikInputNumber } from '@frontend/common/src/components/Formik';
import { FormikDatePicker } from '@frontend/common/src/components/Formik/components/FormikDataPicker';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { FormikSwitch } from '@frontend/common/src/components/Formik/components/FormikSwitch';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { FormikProps } from 'formik';
import type { ReactNode } from 'react';
import { memo } from 'react';

import { cnLabelNoVerticalSpace, cnNoWrapText } from '../../view.css';
import type { TTransferBlockingRuleFormData } from '../defs';
import { cnEndPeriodDate, cnEndPeriodUnit, cnEndPeriodValue } from '../view.css';

export const EndPeriodSelector = memo(
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
                <FormikForm.Item name="selectEndDate">
                    <div className={cnLabelNoVerticalSpace}>
                        <span className={cnNoWrapText}>End time</span>
                        <FormikSwitch
                            {...AddTransferBlockingRuleTabProps[
                                EAddTransferBlockingRuleTabSelectors.EndTimeSwitch
                            ]}
                            name="selectEndDate"
                            checkedChildren="Custom"
                            unCheckedChildren="Period"
                        />
                    </div>
                </FormikForm.Item>

                {values.selectEndDate && (
                    <FormikForm.Item name="endTime">
                        <div className={cn(cnLabelNoVerticalSpace, cnEndPeriodDate)}>
                            <FormikDatePicker
                                {...AddTransferBlockingRuleTabProps[
                                    EAddTransferBlockingRuleTabSelectors.EndTimeInput
                                ]}
                                timeZone={timeZone}
                                name="endTime"
                                showTime
                                allowClear
                            />
                        </div>
                    </FormikForm.Item>
                )}

                {!values.selectEndDate && (
                    <>
                        <FormikForm.Item name="periodValue">
                            <div className={cn(cnLabelNoVerticalSpace, cnEndPeriodValue)}>
                                <FormikInputNumber
                                    {...AddTransferBlockingRuleTabProps[
                                        EAddTransferBlockingRuleTabSelectors.PeriodInput
                                    ]}
                                    name="periodValue"
                                    min={0}
                                />
                            </div>
                        </FormikForm.Item>
                        <FormikForm.Item name="periodUnit">
                            <div className={cn(cnLabelNoVerticalSpace, cnEndPeriodUnit)}>
                                <FormikSelect
                                    {...AddTransferBlockingRuleTabProps[
                                        EAddTransferBlockingRuleTabSelectors.PeriodSelector
                                    ]}
                                    name="periodUnit"
                                    options={
                                        [
                                            { label: 'Hours', value: 'hours' },
                                            { label: 'Days', value: 'days' },
                                        ] as {
                                            label: ReactNode;
                                            value: TTransferBlockingRuleFormData['periodUnit'];
                                        }[]
                                    }
                                />
                            </div>
                        </FormikForm.Item>
                    </>
                )}
            </div>
        );
    },
);
