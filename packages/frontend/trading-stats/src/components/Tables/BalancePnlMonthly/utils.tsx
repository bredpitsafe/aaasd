import type { Nil } from '@common/types';
import { assertNever } from '@common/utils';
import type {
    IAggFuncParams,
    RowClassParams,
    RowClassRules,
} from '@frontend/ag-grid/src/ag-grid-community.ts';
import { AgValue } from '@frontend/ag-grid/src/AgValue.ts';
import type { TAmountUSD } from '@frontend/common/src/types/domain/tradingStats.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { isNil, isUndefined, max, sum, uniq } from 'lodash-es';

import { cnRowFooter } from '../style.css.ts';
import type { TBalancePnlMonthly } from './types';

export function getAllDates(data?: TBalancePnlMonthly[]): string[] {
    if (isUndefined(data)) {
        return EMPTY_ARRAY;
    }

    return data
        .reduce((acc: string[], { profits }) => uniq(acc.concat(Object.keys(profits))), [])
        .sort();
}

export enum EAggFuncs {
    SumExceptEmpty = 'sumExceptEmpty',
}

export const aggFuncs = {
    [EAggFuncs.SumExceptEmpty]: (
        params: IAggFuncParams<
            TBalancePnlMonthly,
            AgValue<TAmountUSD, { isApproximateProfit?: boolean }>
        >,
    ): undefined | AgValue<TAmountUSD, { isApproximateProfit?: boolean }> => {
        if (
            params.values.length === 0 ||
            params.values.every((agValue) => isNil(agValue?.payload))
        ) {
            return (
                AgValue.create(null as TAmountUSD, { isApproximateProfit: undefined }, [
                    'isApproximateProfit',
                ]) ?? undefined
            );
        }

        return (
            AgValue.create(
                sum(params.values.map((agValue) => agValue?.payload ?? 0)) as TAmountUSD,
                {
                    isApproximateProfit: params.values.reduce(
                        (acc: undefined | boolean, agValue) => {
                            if (acc === true || isNil(agValue)) {
                                return acc;
                            }

                            switch (agValue.data.isApproximateProfit) {
                                case false:
                                case true:
                                    return agValue.data.isApproximateProfit;
                                case undefined:
                                    return acc;
                                default:
                                    assertNever(agValue.data.isApproximateProfit);
                            }
                        },
                        undefined,
                    ),
                },
                ['isApproximateProfit'],
            ) ?? undefined
        );
    },
};

export function getRowClassRules(): RowClassRules<TBalancePnlMonthly> {
    return {
        [cnRowFooter]: ({ node }: RowClassParams<TBalancePnlMonthly>) => node.footer,
    };
}

export function calculateHeatmapTotals(list: TBalancePnlMonthly[] | undefined): number {
    const values = list
        ?.map(({ profit, profits }) => [
            profit,
            ...Object.values(profits).map(({ profit }) => profit),
        ])
        .flat()
        .filter((amount): amount is Exclude<TAmountUSD, Nil> => !isNil(amount))
        .map((amount) => Math.abs(amount));

    return isNil(values) || values.length === 0 ? 0 : (max(values) as number);
}
