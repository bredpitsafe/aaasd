import { createTestProps } from '../../../../index';

export enum ETransfersHistoryTabSelectors {
    TransfersHistoryTab = 'transfersHistoryTab',
    TransfersHistoryFilter = '[data-test="transfersHistoryTab"] [class*="ag-icon-filter"]',
}

export const TransfersHistoryTabProps = {
    [ETransfersHistoryTabSelectors.TransfersHistoryTab]: createTestProps(
        ETransfersHistoryTabSelectors.TransfersHistoryTab,
    ),
};
