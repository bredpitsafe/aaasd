import type { TBalanceStatMonthly } from '@frontend/common/src/types/domain/tradingStats';

import type { TBalancePnlMonthly } from '../components/Tables/BalancePnlMonthly/types';
import { groupMonthlyPnlStats } from './groupMonthlyPnlStats';

type TTestData = {
    name: string;
    data: TBalanceStatMonthly[];
    expected: TBalancePnlMonthly[];
};

describe('groupMonthlyPnlStats', () => {
    const tests: TTestData[] = [
        {
            name: 'empty',
            data: [],
            expected: [],
        },
        {
            name: 'single strategy',
            data: [
                {
                    strategy: 'TestStrat',
                    date: '2022-05-01',
                    amountUsd: 1,
                    isApprox: false,
                },
                {
                    strategy: 'TestStrat',
                    date: '2022-05-02',
                    amountUsd: 2,
                    isApprox: false,
                },
            ],
            expected: [
                {
                    name: 'TestStrat',
                    profit: 3,
                    isApproximateProfit: false,
                    profits: {
                        '2022-05-01': {
                            date: '2022-05-01',
                            profit: 1,
                            isApproximateProfit: false,
                        },
                        '2022-05-02': {
                            date: '2022-05-02',
                            profit: 2,
                            isApproximateProfit: false,
                        },
                    },
                },
            ],
        },
        {
            name: 'several strategies',
            data: [
                {
                    strategy: 'TestStrat1',
                    date: '2022-05-01',
                    amountUsd: 1,
                    isApprox: false,
                },
                {
                    strategy: 'TestStrat2',
                    date: '2022-05-02',
                    amountUsd: 2,
                    isApprox: false,
                },
            ],
            expected: [
                {
                    name: 'TestStrat1',
                    profit: 1,
                    isApproximateProfit: false,
                    profits: {
                        '2022-05-01': {
                            date: '2022-05-01',
                            profit: 1,
                            isApproximateProfit: false,
                        },
                    },
                },
                {
                    name: 'TestStrat2',
                    profit: 2,
                    isApproximateProfit: false,
                    profits: {
                        '2022-05-02': {
                            date: '2022-05-02',
                            profit: 2,
                            isApproximateProfit: false,
                        },
                    },
                },
            ],
        },
        {
            name: 'approximate profit (null)',
            data: [
                {
                    strategy: 'TestStrat',
                    date: '2022-05-01',
                    amountUsd: 1,
                    isApprox: false,
                },
                {
                    strategy: 'TestStrat',
                    date: '2022-05-02',
                    amountUsd: null,
                    isApprox: true,
                },
            ],
            expected: [
                {
                    name: 'TestStrat',
                    profit: 1,
                    isApproximateProfit: true,
                    profits: {
                        '2022-05-01': {
                            date: '2022-05-01',
                            profit: 1,
                            isApproximateProfit: false,
                        },
                        '2022-05-02': {
                            date: '2022-05-02',
                            profit: null,
                            isApproximateProfit: false,
                        },
                    },
                },
            ],
        },
        {
            name: 'approximate profit (non-null)',
            data: [
                {
                    strategy: 'TestStrat',
                    date: '2022-05-01',
                    amountUsd: 1,
                    isApprox: false,
                },
                {
                    strategy: 'TestStrat',
                    date: '2022-05-02',
                    amountUsd: 2,
                    isApprox: true,
                },
            ],
            expected: [
                {
                    name: 'TestStrat',
                    profit: 3,
                    isApproximateProfit: true,
                    profits: {
                        '2022-05-01': {
                            date: '2022-05-01',
                            profit: 1,
                            isApproximateProfit: false,
                        },
                        '2022-05-02': {
                            date: '2022-05-02',
                            profit: 2,
                            isApproximateProfit: true,
                        },
                    },
                },
            ],
        },
    ];

    tests.forEach((testCase) => {
        it(`should group '${testCase.name}' data`, () => {
            const groupedData = groupMonthlyPnlStats(testCase.data, {
                from: '',
                to: '',
                backtestingId: undefined,
            });
            expect(groupedData).toEqual(testCase.expected);
        });
    });
});
