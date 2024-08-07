import { createTestProps } from '../../../../index';

export enum EInternalTransfersHistoryTabSelectors {
    InternalTransfersHistoryTab = 'internalTransfersHistoryTab',
}

export const InternalTransfersHistoryTabProps = {
    [EInternalTransfersHistoryTabSelectors.InternalTransfersHistoryTab]: createTestProps(
        EInternalTransfersHistoryTabSelectors.InternalTransfersHistoryTab,
    ),
};
