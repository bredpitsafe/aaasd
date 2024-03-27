import { createTestProps } from '../../../../index';

export enum EAmountLimitsRulesTabSelector {
    AmountLimitsRulesTab = 'amountLimitsRulesTab',
}

export const EAmountLimitsRulesTabProps = {
    [EAmountLimitsRulesTabSelector.AmountLimitsRulesTab]: createTestProps(
        EAmountLimitsRulesTabSelector.AmountLimitsRulesTab,
    ),
};
