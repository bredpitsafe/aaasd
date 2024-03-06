import { createTestProps } from '../../../../index';

export enum EAutoTransferRulesTabSelector {
    AutoTransferRulesTab = 'autoTransferRulesTab',
}

export const EAutoTransferRulesTabProps = {
    [EAutoTransferRulesTabSelector.AutoTransferRulesTab]: createTestProps(
        EAutoTransferRulesTabSelector.AutoTransferRulesTab,
    ),
};
