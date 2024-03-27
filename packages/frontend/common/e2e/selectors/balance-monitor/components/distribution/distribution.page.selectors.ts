import { createTestProps } from '../../../../index';

export enum EDistributionTabSelectors {
    DistributionTab = 'distributionTab',
    CoinSelector = 'coinSelector',
    Chart = '[class="ag-chart-wrapper"]',

    RemoveCoinButton = '[data-test="coinSelector"] [data-icon="close-circle"]',
}

export const DistributionTabProps = {
    [EDistributionTabSelectors.DistributionTab]: createTestProps(
        EDistributionTabSelectors.DistributionTab,
    ),
    [EDistributionTabSelectors.CoinSelector]: createTestProps(
        EDistributionTabSelectors.CoinSelector,
    ),
};
