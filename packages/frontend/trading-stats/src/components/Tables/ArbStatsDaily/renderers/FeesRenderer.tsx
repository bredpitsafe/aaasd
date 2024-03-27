import { ColDef, ICellRendererParams, ValueFormatterFunc } from '@frontend/ag-grid';
import { usdFormatter } from '@frontend/common/src/components/AgTable/formatters/usd';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { sprintf } from '@frontend/common/src/utils/sprintf/sprintf';
import { memo, ReactElement } from 'react';

import { TArbStatsDailyAsset } from '../types';
import { EAggFuncs } from '../utils';

const usdFormatterFn = usdFormatter(false);
const feeFormatter: ValueFormatterFunc<TArbStatsDailyAsset, TArbStatsDailyAsset['feesUsd']> = (
    params,
) => {
    const fee = params.data?.fees?.[0];
    const feeStr = fee ? sprintf('(%.2f %s)', fee.value, fee.assetName) : '';
    return `${usdFormatterFn(params)} ${feeStr}`;
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
        equals: () => false,
        valueFormatter: feeFormatter,
        cellRenderer: FeesRenderer,
        aggFunc: EAggFuncs.SumExceptRootRow,
    };
}
