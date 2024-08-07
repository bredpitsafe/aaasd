import { createTestProps } from '../../../../index';

export enum ECommonRuleTabSelectors {
    CoinSelector = 'coinSelector',
    AccountSelector = 'accountSelector',
    ExchangeSelector = 'exchangeSelector',
    BothDirectionsSwitch = 'bothDirectionsSwitch',
    NotesInput = 'notesInput',
    RulePriorityInput = 'rulePriorityInput',
    RadioButton = '[class*="ant-radio-button-wrapper"]',
}

export const CommonRuleTabProps = {
    [ECommonRuleTabSelectors.CoinSelector]: createTestProps(ECommonRuleTabSelectors.CoinSelector),
    [ECommonRuleTabSelectors.AccountSelector]: createTestProps(
        ECommonRuleTabSelectors.AccountSelector,
    ),
    [ECommonRuleTabSelectors.ExchangeSelector]: createTestProps(
        ECommonRuleTabSelectors.ExchangeSelector,
    ),
    [ECommonRuleTabSelectors.BothDirectionsSwitch]: createTestProps(
        ECommonRuleTabSelectors.BothDirectionsSwitch,
    ),
    [ECommonRuleTabSelectors.NotesInput]: createTestProps(ECommonRuleTabSelectors.NotesInput),
    [ECommonRuleTabSelectors.RadioButton]: createTestProps(ECommonRuleTabSelectors.RadioButton),
    [ECommonRuleTabSelectors.RulePriorityInput]: createTestProps(
        ECommonRuleTabSelectors.RulePriorityInput,
    ),
};
