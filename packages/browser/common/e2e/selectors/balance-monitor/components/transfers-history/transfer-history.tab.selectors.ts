import { createTestProps } from '../../../../index';

export enum ETransfersHistoryTabSelectors {
    TransfersHistoryTab = 'transfersHistoryTab',
}

export const TransfersHistoryTabProps = {
    [ETransfersHistoryTabSelectors.TransfersHistoryTab]: createTestProps(
        ETransfersHistoryTabSelectors.TransfersHistoryTab,
    ),
};
