import type { TimeZone } from '@common/types';
import {
    AddTransferBlockingRuleTabProps,
    EAddTransferBlockingRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-transfer-blocking-rule/add-transfer-bloking-rule.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm } from '@frontend/common/src/components/Formik';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { AccountSelector } from '../components/AccountSelector';
import { BidirectionalSwitch } from '../components/BidirectionalSwitch';
import { CoinSelector } from '../components/CoinSelector';
import { ExchangeSelector } from '../components/ExchangeSelector';
import { NotesInput } from '../components/NotesInput';
import { areCommonRulesEqual } from '../components/utils';
import {
    cnActionButton,
    cnActionsContainer,
    cnContainer,
    cnFullWidthGridRow,
    cnLabelNoVerticalSpace,
} from '../view.css';
import { DisabledGroupsSelector } from './components/DisabledGroupsSelector';
import { EndPeriodSelector } from './components/EndPeriodSelector';
import { IsPermanentSwitch } from './components/IsPermanentSwitch';
import { ShowAlertSwitch } from './components/ShowAlertSwitch';
import { StartPeriodSelector } from './components/StartPeriodSelector';
import type { TTransferBlockingRuleFormData } from './defs';
import { INITIAL_VALUES } from './view';
import {
    cnNowrapContainer,
    cnSwitchesLayout,
    cnTransferBlockingRulesFormLayout,
    cnWideCell,
    cnWrapContainer,
} from './view.css';

export const TransferBlockingRulesForm = memo(
    ({
        formik,
        timeZone,
        coinInfo,
        createTransferBlockingRuleInProgress,
        editFormData,
    }: TWithFormik<Partial<TTransferBlockingRuleFormData>> & {
        timeZone: TimeZone;
        coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>;
        createTransferBlockingRuleInProgress: boolean;
        editFormData?: TTransferBlockingRuleFormData;
    }) => {
        const { values, isValid, setTouched, setValues } = formik;

        const handleReset = useFunction(() => {
            if (isNil(editFormData)) {
                setTouched({}, false);
            }
            setValues(editFormData ?? INITIAL_VALUES, true);
        });

        const canSubmit = useMemo(() => {
            if (isNil(editFormData)) {
                return true;
            }

            return (
                !areCommonRulesEqual(values, editFormData) ||
                values.disabledGroups !== editFormData.disabledGroups ||
                values.showAlert !== editFormData.showAlert ||
                !arePeriodsEquals(values, editFormData)
            );
        }, [editFormData, values]);

        return (
            <FormikForm
                {...AddTransferBlockingRuleTabProps[
                    EAddTransferBlockingRuleTabSelectors.AddTransferBlockingRuleTab
                ]}
                layout="vertical"
                className={cnContainer}
            >
                <div className={cnTransferBlockingRulesFormLayout}>
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

                    <DisabledGroupsSelector className={cnWideCell} />

                    <div className={cn(cnFullWidthGridRow, cnSwitchesLayout)}>
                        <BidirectionalSwitch classNameNested={cnLabelNoVerticalSpace} />
                        <ShowAlertSwitch classNameNested={cnLabelNoVerticalSpace} />
                        <IsPermanentSwitch />
                    </div>

                    <div className={cn(cnFullWidthGridRow, cnWrapContainer)}>
                        {!formik.values.isPermanent && (
                            <>
                                <StartPeriodSelector
                                    className={cnNowrapContainer}
                                    formik={formik}
                                    timeZone={timeZone}
                                />
                                <EndPeriodSelector
                                    className={cnNowrapContainer}
                                    formik={formik}
                                    timeZone={timeZone}
                                />
                            </>
                        )}
                    </div>

                    <NotesInput className={cnFullWidthGridRow} />

                    <FormikForm.Item className={cnFullWidthGridRow} name="submit">
                        <div className={cnActionsContainer}>
                            <Button
                                {...AddTransferBlockingRuleTabProps[
                                    EAddTransferBlockingRuleTabSelectors.ClearButton
                                ]}
                                className={cnActionButton}
                                onClick={handleReset}
                            >
                                Clear
                            </Button>
                            <Button
                                {...AddTransferBlockingRuleTabProps[
                                    EAddTransferBlockingRuleTabSelectors.CreateButton
                                ]}
                                className={cnActionButton}
                                htmlType="submit"
                                type="primary"
                                disabled={
                                    !isValid || createTransferBlockingRuleInProgress || !canSubmit
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

function arePeriodsEquals(
    left: Partial<TTransferBlockingRuleFormData>,
    right: Partial<TTransferBlockingRuleFormData>,
) {
    if (left.isPermanent !== right.isPermanent) {
        return false;
    }

    if (left.isPermanent) {
        return true;
    }

    if (left.startImmediately !== right.startImmediately || left.startTime !== right.startTime) {
        return false;
    }

    if (left.selectEndDate !== right.selectEndDate) {
        return false;
    }

    return left.selectEndDate
        ? left.endTime === right.endTime
        : left.periodValue === right.periodValue && left.periodUnit === right.periodUnit;
}
