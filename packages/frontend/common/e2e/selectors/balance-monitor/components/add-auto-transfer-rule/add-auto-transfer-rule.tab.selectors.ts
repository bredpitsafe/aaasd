import { createTestProps } from '../../../../index';

export enum EAddAutoTransferRuleSelectors {
    AddAutoTransferRuleTab = 'addAutoTransferRuleTab',
    AutoTransferSwitch = 'autoTransferSwitch',
    ClearButton = 'clearButton',
    CreateButton = 'createButton',
}

export const AddAutoTransferRuleTabProps = {
    [EAddAutoTransferRuleSelectors.AddAutoTransferRuleTab]: createTestProps(
        EAddAutoTransferRuleSelectors.AddAutoTransferRuleTab,
    ),
    [EAddAutoTransferRuleSelectors.AutoTransferSwitch]: createTestProps(
        EAddAutoTransferRuleSelectors.AutoTransferSwitch,
    ),
    [EAddAutoTransferRuleSelectors.ClearButton]: createTestProps(
        EAddAutoTransferRuleSelectors.ClearButton,
    ),
    [EAddAutoTransferRuleSelectors.CreateButton]: createTestProps(
        EAddAutoTransferRuleSelectors.CreateButton,
    ),
};
