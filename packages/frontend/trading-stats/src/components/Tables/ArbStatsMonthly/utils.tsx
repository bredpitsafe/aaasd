import type {
    IAggFuncParams,
    ITooltipParams,
    RowClassParams,
    RowClassRules,
} from '@frontend/ag-grid';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { formatUsd } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { first, isEmpty, isNil, isUndefined, sum, uniq } from 'lodash-es';

import { cnRowFooter, cnRowLevel0, cnRowLevel1 } from '../style.css.ts';
import type { TArbMonthlyStrategy, TArbMonthlyValue } from './types';

export function getAllDates(data?: TArbMonthlyStrategy[]): string[] {
    if (isUndefined(data)) {
        return EMPTY_ARRAY;
    }

    return data
        .reduce((acc: string[], { values }) => uniq(acc.concat(Object.keys(values))), [])
        .sort();
}

export enum EAggFuncs {
    SumExceptFirstLevel = 'sumExceptFirstLevel',
}

export const aggFuncs = {
    [EAggFuncs.SumExceptFirstLevel]: (
        params: IAggFuncParams<TArbMonthlyStrategy, TArbMonthlyValue | undefined>,
    ) => {
        if (params.rowNode.level === 0) {
            return first(params.values);
        }

        const values = params.values.filter((v) => !isNil(v)) as TArbMonthlyValue[];

        if (isEmpty(values)) {
            return;
        }

        return sum(values.filter((v) => !isNil(v)));
    },
};

export function getRowClassRules(): RowClassRules<TArbMonthlyStrategy> {
    return {
        [cnRowLevel0]: ({ node }: RowClassParams<TArbMonthlyStrategy>) => node.level === 0,
        [cnRowLevel1]: ({ node }: RowClassParams<TArbMonthlyStrategy>) => node.level === 1,
        [cnRowFooter]: ({ node }: RowClassParams<TArbMonthlyStrategy>) => node.footer,
    };
}

export const tooltipFullUsdValueGetter = (params: ITooltipParams): string | undefined => {
    if (!params.value) {
        return;
    }

    const fullValue = formatUsd(params.value);
    if (params.valueFormatted !== fullValue) {
        return fullValue;
    }
};
