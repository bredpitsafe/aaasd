import { createTestProps } from '../../../../index';

export enum EAddTransferBlockingRuleTabSelectors {
    AddTransferBlockingRuleTab = 'addTransferBlockingRuleTab',
    DisabledSelector = 'disabledSelector',
    AlertSwitch = 'alertSwitch',
    PermanentSwitch = 'permanentSwitch',
    StartTimeInput = 'startPeriodInput',
    StartTimeSwitch = 'startTimeSwitch',
    EndTimeInput = 'endPeriodInput',
    EndTimeSwitch = 'endTimeSwitch',
    PeriodSelector = 'periodSelector',
    PeriodInput = 'periodInput',
    ClearButton = 'clearButton',
    CreateButton = 'createButton',
}

export const AddTransferBlockingRuleTabProps = {
    [EAddTransferBlockingRuleTabSelectors.AddTransferBlockingRuleTab]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.AddTransferBlockingRuleTab,
    ),
    [EAddTransferBlockingRuleTabSelectors.DisabledSelector]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.DisabledSelector,
    ),
    [EAddTransferBlockingRuleTabSelectors.AlertSwitch]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.AlertSwitch,
    ),
    [EAddTransferBlockingRuleTabSelectors.PermanentSwitch]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.PermanentSwitch,
    ),
    [EAddTransferBlockingRuleTabSelectors.ClearButton]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.ClearButton,
    ),
    [EAddTransferBlockingRuleTabSelectors.CreateButton]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.CreateButton,
    ),
    [EAddTransferBlockingRuleTabSelectors.StartTimeInput]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.StartTimeInput,
    ),
    [EAddTransferBlockingRuleTabSelectors.StartTimeSwitch]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.StartTimeSwitch,
    ),
    [EAddTransferBlockingRuleTabSelectors.EndTimeInput]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.EndTimeInput,
    ),
    [EAddTransferBlockingRuleTabSelectors.PeriodSelector]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.PeriodSelector,
    ),
    [EAddTransferBlockingRuleTabSelectors.PeriodInput]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.PeriodInput,
    ),
    [EAddTransferBlockingRuleTabSelectors.EndTimeSwitch]: createTestProps(
        EAddTransferBlockingRuleTabSelectors.EndTimeSwitch,
    ),
};
