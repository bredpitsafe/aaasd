import {
    AddAmountLimitsRuleTabProps,
    EAddAmountLimitsRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-amount-limits-rule/add-amount-limits-rule.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Collapse } from '@frontend/common/src/components/Collapse';
import { FormikForm, TWithFormik } from '@frontend/common/src/components/Formik';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TConvertRatesDescriptor } from '../../../modules/observables/ModuleConvertRates';
import { AccountSelector } from '../components/AccountSelector';
import { BidirectionalSwitch } from '../components/BidirectionalSwitch';
import { CoinSelector } from '../components/CoinSelector';
import { DoNotOverrideSwitch } from '../components/DoNotOverrideSwitch';
import { ExchangeSelector } from '../components/ExchangeSelector';
import { NotesInput } from '../components/NotesInput';
import { RulePriorityInput } from '../components/RulePriorityInput';
import { areCommonRulesEqual } from '../components/utils';
import { cnActionButton, cnActionsContainer, cnContainer, cnFullWidthGridRow } from '../view.css';
import { AmountCurrencyRadio } from './components/AmountCurrencyRadio';
import { AmountInput } from './components/AmountInput';
import type { TAmountLimitsRuleFormData } from './defs';
import {
    cnAdvancedOptionsContainer,
    cnAmountLimitsRulesFormLayout,
    cnLabelVerticalSpace,
    cnWideCell,
} from './view.css';

export const AmountLimitsRulesForm = memo(
    ({
        formik,
        coinInfo,
        createAmountLimitsRuleInProgress,
        convertRatesDescriptor,
        editFormData,
    }: TWithFormik<Partial<TAmountLimitsRuleFormData>> & {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        createAmountLimitsRuleInProgress: boolean;
        convertRatesDescriptor: TConvertRatesDescriptor;
        editFormData?: TAmountLimitsRuleFormData;
    }) => {
        const { values, isValid, setValues, setTouched, initialValues } = formik;

        const handleReset = useFunction(() => {
            if (isNil(editFormData)) {
                setTouched({}, false);
            }
            setValues(initialValues, true);
        });

        const canSubmit = useMemo(() => {
            if (isNil(editFormData)) {
                return true;
            }

            return (
                !areCommonRulesEqual(values, editFormData) ||
                values.amountCurrency !== editFormData.amountCurrency ||
                values.amountMin !== editFormData.amountMin ||
                values.amountMax !== editFormData.amountMax ||
                values.rulePriority !== editFormData.rulePriority ||
                values.doNotOverride !== editFormData.doNotOverride
            );
        }, [editFormData, values]);

        return (
            <FormikForm
                {...AddAmountLimitsRuleTabProps[
                    EAddAmountLimitsRuleTabSelectors.AddAmountLimitsRuleTab
                ]}
                layout="vertical"
                className={cnContainer}
            >
                <div className={cnAmountLimitsRulesFormLayout}>
                    <CoinSelector className={cnFullWidthGridRow} coinInfo={coinInfo} />
                    <ExchangeSelector
                        className={cnWideCell}
                        formik={formik}
                        coinInfo={coinInfo}
                        label="Source Exchange"
                        accountInfoField="from"
                        exchangeField="sourceExchangesMatchRule"
                    />
                    <AccountSelector
                        className={cnWideCell}
                        formik={formik}
                        coinInfo={coinInfo}
                        label="Source Account"
                        accountInfoField="from"
                        exchangeField="sourceExchangesMatchRule"
                        accountField="sourceAccountsMatchRule"
                    />
                    <ExchangeSelector
                        className={cnWideCell}
                        formik={formik}
                        coinInfo={coinInfo}
                        label="Destination Exchange"
                        accountInfoField="to"
                        exchangeField="destinationExchangesMatchRule"
                    />
                    <AccountSelector
                        className={cnWideCell}
                        formik={formik}
                        coinInfo={coinInfo}
                        label="Destination Account"
                        accountInfoField="to"
                        exchangeField="destinationExchangesMatchRule"
                        accountField="destinationAccountsMatchRule"
                    />

                    <BidirectionalSwitch
                        className={cnWideCell}
                        classNameNested={cnLabelVerticalSpace}
                    />

                    <AmountCurrencyRadio className={cnWideCell} formik={formik} />

                    <AmountInput
                        className={cnWideCell}
                        formik={formik}
                        amountField="amountMin"
                        label="Min Amount"
                        convertRatesDescriptor={convertRatesDescriptor}
                    />
                    <AmountInput
                        className={cnWideCell}
                        formik={formik}
                        amountField="amountMax"
                        label="Max Amount"
                        convertRatesDescriptor={convertRatesDescriptor}
                    />

                    <NotesInput className={cnFullWidthGridRow} />

                    <Collapse className={cnFullWidthGridRow}>
                        <Collapse.Panel key="1" header="Advanced Mode">
                            <div className={cnAdvancedOptionsContainer}>
                                <RulePriorityInput />
                                <DoNotOverrideSwitch />
                            </div>
                        </Collapse.Panel>
                    </Collapse>

                    <FormikForm.Item className={cnFullWidthGridRow} name="submit">
                        <div className={cnActionsContainer}>
                            <Button
                                {...AddAmountLimitsRuleTabProps[
                                    EAddAmountLimitsRuleTabSelectors.ClearButton
                                ]}
                                className={cnActionButton}
                                onClick={handleReset}
                            >
                                Clear
                            </Button>
                            <Button
                                {...AddAmountLimitsRuleTabProps[
                                    EAddAmountLimitsRuleTabSelectors.CreateButton
                                ]}
                                className={cnActionButton}
                                htmlType="submit"
                                type="primary"
                                disabled={
                                    !isValid || createAmountLimitsRuleInProgress || !canSubmit
                                }
                            >
                                {isNil(editFormData) ? 'Create' : 'Update'}
                            </Button>
                        </div>
                    </FormikForm.Item>
                </div>
            </FormikForm>
        );
    },
);
