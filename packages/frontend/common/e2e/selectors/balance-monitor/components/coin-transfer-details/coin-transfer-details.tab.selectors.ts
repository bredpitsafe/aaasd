import { createTestProps } from '../../../../index';

export enum ECoinTransferDetailsTabSelectors {
    CoinTransferDetailsTab = 'coinTransferDetailsTab',
    CoinTransferFilter = 'coinTransferFilter',
    CoinRefreshButton = 'coinTransferDetails',
}

export const CoinTransferDetailsTabProps = {
    [ECoinTransferDetailsTabSelectors.CoinTransferDetailsTab]: createTestProps(
        ECoinTransferDetailsTabSelectors.CoinTransferDetailsTab,
    ),
    [ECoinTransferDetailsTabSelectors.CoinTransferFilter]: createTestProps(
        ECoinTransferDetailsTabSelectors.CoinTransferFilter,
    ),
    [ECoinTransferDetailsTabSelectors.CoinRefreshButton]: createTestProps(
        ECoinTransferDetailsTabSelectors.CoinRefreshButton,
    ),
};
