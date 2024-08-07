import {
    AddAutoTransferRuleTabProps,
    EAddAutoTransferRuleSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-auto-transfer-rule/add-auto-transfer-rule.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Collapse } from '@frontend/common/src/components/Collapse';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm } from '@frontend/common/src/components/Formik';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { AccountSelector } from '../components/AccountSelector';
import { BidirectionalSwitch } from '../components/BidirectionalSwitch';
import { CoinSelector } from '../components/CoinSelector';
import { ExchangeSelector } from '../components/ExchangeSelector';
import { NotesInput } from '../components/NotesInput';
import { RulePriorityInput } from '../components/RulePriorityInput';
import { areCommonRulesEqual } from '../components/utils';
import { cnActionButton, cnActionsContainer, cnContainer, cnFullWidthGridRow } from '../view.css';
import { EnableAutoSwitch } from './components/EnableAutoSwitch';
import type { TAutoTransferRuleFormData } from './defs';
import {
    cnAdvancedOptionsContainer,
    cnAutoTransferRulesFormLayout,
    cnLabelVerticalSpace,
    cnWideCell,
} from './view.css';

export const AutoTransferRulesForm = memo(
    ({
        formik,
        coinInfo,
        createAutoTransferRuleInProgress,
        editFormData,
    }: TWithFormik<Partial<TAutoTransferRuleFormData>> & {
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        createAutoTransferRuleInProgress: boolean;
        editFormData?: TAutoTransferRuleFormData;
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
                values.enableAuto !== editFormData.enableAuto ||
                values.rulePriority !== editFormData.rulePriority
            );
        }, [editFormData, values]);

        return (
            <FormikForm
                {...AddAutoTransferRuleTabProps[
                    EAddAutoTransferRuleSelectors.AddAutoTransferRuleTab
                ]}
                layout="vertical"
                className={cnContainer}
            >
                <div className={cnAutoTransferRulesFormLayout}>
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

                    <EnableAutoSwitch
                        className={cnWideCell}
                        classNameNested={cnLabelVerticalSpace}
                    />

                    <NotesInput className={cnFullWidthGridRow} />

                    <Collapse className={cnFullWidthGridRow}>
                        <Collapse.Panel key="1" header="Advanced Mode">
                            <div className={cnAdvancedOptionsContainer}>
                                <RulePriorityInput />
                            </div>
                        </Collapse.Panel>
                    </Collapse>

                    <FormikForm.Item className={cnFullWidthGridRow} name="submit">
                        <div className={cnActionsContainer}>
                            <Button
                                {...AddAutoTransferRuleTabProps[
                                    EAddAutoTransferRuleSelectors.ClearButton
                                ]}
                                className={cnActionButton}
                                onClick={handleReset}
                            >
                                Clear
                            </Button>
                            <Button
                                {...AddAutoTransferRuleTabProps[
                                    EAddAutoTransferRuleSelectors.CreateButton
                                ]}
                                className={cnActionButton}
                                htmlType="submit"
                                type="primary"
                                disabled={
                                    !isValid || createAutoTransferRuleInProgress || !canSubmit
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
