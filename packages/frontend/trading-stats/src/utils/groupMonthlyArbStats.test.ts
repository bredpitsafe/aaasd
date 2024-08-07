// @1ts-nocheck
import { EExchangeName } from '@frontend/common/src/types/domain/exchange';
import type {
    TBaseAssetStatMonthly,
    TExchangeStatMonthly,
} from '@frontend/common/src/types/domain/tradingStats';

import { EArbStatsBreakdownType } from '../components/Tables/ArbStatsDaily/types';
import type { TArbMonthlyStrategy } from '../components/Tables/ArbStatsMonthly/types';
import { groupMonthlyArbStats } from './groupMonthlyArbStats';

type TTestData = {
    name: string;
    assetData: TBaseAssetStatMonthly[];
    exchangeData: TExchangeStatMonthly[];
    expected: TArbMonthlyStrategy[];
};

describe('groupMonthlyArbStats', () => {
    const tests: TTestData[] = [
        {
            name: 'empty',
            assetData: [],
            exchangeData: [],
            expected: [],
        },
        {
            name: 'only assets data',
            assetData: [
                {
                    assetId: 1,
                    assetName: 'TEST',
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 1,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
                {
                    assetId: 2,
                    assetName: 'TEST2',
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 2,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
            ],
            exchangeData: [],
            expected: [
                {
                    key: 'TestStrat|1',
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.AssetWise,
                    name: 'TEST',
                    total: 1,
                    values: {
                        '2022-05-01': 1,
                    },
                },
                {
                    key: 'TestStrat|2',
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.AssetWise,
                    name: 'TEST2',
                    total: 2,
                    values: {
                        '2022-05-01': 2,
                    },
                },
            ],
        },
        {
            name: 'several dates for a single asset',
            assetData: [
                {
                    assetId: 1,
                    assetName: 'TEST',
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 1,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
                {
                    assetId: 1,
                    assetName: 'TEST',
                    date: '2022-05-02',
                    strategy: 'TestStrat',
                    volumeUsd: 2,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
            ],
            exchangeData: [],
            expected: [
                {
                    key: 'TestStrat|1',
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.AssetWise,
                    name: 'TEST',
                    total: 3,
                    values: {
                        '2022-05-01': 1,
                        '2022-05-02': 2,
                    },
                },
            ],
        },
        {
            name: 'only volume data',
            assetData: [],
            exchangeData: [
                {
                    exchangeName: EExchangeName.BinanceSpot,
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 1,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
                {
                    exchangeName: EExchangeName.BinanceSwap,
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 2,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
            ],
            expected: [
                {
                    key: `TestStrat|${EExchangeName.BinanceSpot}`,
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.ExchangeWise,
                    name: EExchangeName.BinanceSpot,
                    total: 1,
                    values: {
                        '2022-05-01': 1,
                    },
                },
                {
                    key: `TestStrat|${EExchangeName.BinanceSwap}`,
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.ExchangeWise,
                    name: EExchangeName.BinanceSwap,
                    total: 2,
                    values: {
                        '2022-05-01': 2,
                    },
                },
            ],
        },
        {
            name: 'asset and exchange data',
            assetData: [
                {
                    assetId: 1,
                    assetName: 'TEST',
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 1,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
                {
                    assetId: 2,
                    assetName: 'TEST2',
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 2,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
            ],
            exchangeData: [
                {
                    exchangeName: EExchangeName.BinanceSpot,
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 1,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
                {
                    exchangeName: EExchangeName.BinanceSwap,
                    date: '2022-05-01',
                    strategy: 'TestStrat',
                    volumeUsd: 2,
                    makerVolumeUsd: 0,
                    takerVolumeUsd: 0,
                    feeAmountUsd: 0,
                },
            ],
            expected: [
                {
                    key: 'TestStrat|1',
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.AssetWise,
                    name: 'TEST',
                    total: 1,
                    values: {
                        '2022-05-01': 1,
                    },
                },
                {
                    key: 'TestStrat|2',
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.AssetWise,
                    name: 'TEST2',
                    total: 2,
                    values: {
                        '2022-05-01': 2,
                    },
                },
                {
                    key: `TestStrat|${EExchangeName.BinanceSpot}`,
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.ExchangeWise,
                    name: EExchangeName.BinanceSpot,
                    total: 1,
                    values: {
                        '2022-05-01': 1,
                    },
                },
                {
                    key: `TestStrat|${EExchangeName.BinanceSwap}`,
                    strategy: 'TestStrat',
                    breakdown: EArbStatsBreakdownType.ExchangeWise,
                    name: EExchangeName.BinanceSwap,
                    total: 2,
                    values: {
                        '2022-05-01': 2,
                    },
                },
            ],
        },
    ];

    tests.forEach((testCase) => {
        it(`should group '${testCase.name}' data`, () => {
            const groupedData = groupMonthlyArbStats(
                'volumeUsd',
                testCase.assetData,
                testCase.exchangeData,
            );
            expect(groupedData).toEqual(testCase.expected);
        });
    });
});
