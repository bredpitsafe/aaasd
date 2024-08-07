import { createTestProps } from '../../../../index';

export enum EAddAmountLimitsRuleTabSelectors {
    AddAmountLimitsRuleTab = 'addAmountLimitsRuleTab',
    AmountCurrencyButton = 'amountCurrencyButton',
    AmountInput = 'amountInput',
    DoNotOverrideSwitch = 'doNotOverrideSwitch',
    ClearButton = 'clearButton',
    CreateButton = 'createButton',
}

export const AddAmountLimitsRuleTabProps = {
    [EAddAmountLimitsRuleTabSelectors.AddAmountLimitsRuleTab]: createTestProps(
        EAddAmountLimitsRuleTabSelectors.AddAmountLimitsRuleTab,
    ),
    [EAddAmountLimitsRuleTabSelectors.AmountCurrencyButton]: createTestProps(
        EAddAmountLimitsRuleTabSelectors.AmountCurrencyButton,
    ),
    [EAddAmountLimitsRuleTabSelectors.AmountInput]: createTestProps(
        EAddAmountLimitsRuleTabSelectors.AmountInput,
    ),
    [EAddAmountLimitsRuleTabSelectors.DoNotOverrideSwitch]: createTestProps(
        EAddAmountLimitsRuleTabSelectors.DoNotOverrideSwitch,
    ),
    [EAddAmountLimitsRuleTabSelectors.ClearButton]: createTestProps(
        EAddAmountLimitsRuleTabSelectors.ClearButton,
    ),
    [EAddAmountLimitsRuleTabSelectors.CreateButton]: createTestProps(
        EAddAmountLimitsRuleTabSelectors.CreateButton,
    ),
};
