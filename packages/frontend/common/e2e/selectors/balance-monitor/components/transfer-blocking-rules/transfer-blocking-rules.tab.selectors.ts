import { createTestProps } from '../../../../index';

export enum ETransferBlockingRulesTabSelector {
    TransferBlockingRulesTab = 'transferBlockingRulesTab',
}

export const ETransferBlockingRulesTabProps = {
    [ETransferBlockingRulesTabSelector.TransferBlockingRulesTab]: createTestProps(
        ETransferBlockingRulesTabSelector.TransferBlockingRulesTab,
    ),
};
