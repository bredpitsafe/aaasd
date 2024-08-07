import type { ColDef, ICellRendererParams, ValueFormatterFunc } from '@frontend/ag-grid';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { formatUsd } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { sprintf } from '@frontend/common/src/utils/sprintf/sprintf';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo } from 'react';

import type { TArbStatsDailyAsset, TArbStatsDailyColumnValueWithAggregation } from '../types';
import { EAggFuncs } from '../utils';

const feeFormatter: ValueFormatterFunc<
    TArbStatsDailyAsset,
    TArbStatsDailyColumnValueWithAggregation | null
> = (params) => {
    if (isNil(params.data)) {
        return formatUsd(params.value?.value);
    }
    const fee = params.data?.fees?.[0];
    const feeStr = fee ? sprintf('(%.2f %s)', fee.value, fee.assetName) : '';
    return `${formatUsd(params.data.feesUsd)} ${feeStr}`;
};

const FEE_FORMAT = '%.2f %s';
const FeesRenderer = memo(
    (
        params: ICellRendererParams<TArbStatsDailyAsset['feesUsd'], TArbStatsDailyAsset>,
    ): ReactElement | null => {
        const fees = params.data?.fees;

        if (fees?.length !== undefined && fees.length > 1) {
            const currencyFees = fees.map((fee) => (
                <div key={fee.assetName}>{sprintf(FEE_FORMAT, fee.value, fee.assetName)}</div>
            ));

            return <Tooltip title={currencyFees}>{params.valueFormatted}</Tooltip>;
        }

        return <>{params.valueFormatted}</>;
    },
);

export function createFeesColumn(): ColDef<TArbStatsDailyAsset> {
    return {
        field: 'feesUsd',
        headerName: 'Fees',
        equals: (
            prev: TArbStatsDailyColumnValueWithAggregation,
            next: TArbStatsDailyColumnValueWithAggregation,
        ) => {
            return prev.value === next.value && prev.shouldAggregate === next.shouldAggregate;
        },
        valueGetter: (params) => {
            return {
                value: params.data?.feesUsd,
                shouldAggregate: params.data?.shouldAggregate,
            };
        },
        valueFormatter: feeFormatter,
        cellRenderer: FeesRenderer,
        comparator: (_valA, _valB, nodeA, nodeB) => {
            if (nodeA.data?.feesUsd && nodeB.data?.feesUsd)
                return nodeA.data?.feesUsd - nodeB.data?.feesUsd;
            return 0;
        },
        aggFunc: EAggFuncs.SumExceptRootRow,
    };
}
