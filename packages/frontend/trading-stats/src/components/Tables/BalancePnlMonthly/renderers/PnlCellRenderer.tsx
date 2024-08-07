import type { ICellRendererParams, ValueGetterParams } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { NumberColorizerRenderer } from '@frontend/common/src/components/AgTable/renderers/NumberColorizerRenderer';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type { TAmountUSD } from '@frontend/common/src/types/domain/tradingStats';
import { formatUsd } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { isNil } from 'lodash-es';
import type { ForwardedRef, ReactElement } from 'react';
import { forwardRef, memo } from 'react';

import type { TBalancePnlMonthly } from '../types';

export const pnlCellValueGetterFactory =
    (getAmountUsd: (data: TBalancePnlMonthly) => TAmountUSD) =>
    ({ data }: ValueGetterParams<TBalancePnlMonthly>) => {
        return data && AgValue.create(getAmountUsd(data), data, ['isApproximateProfit']);
    };

export const PnlCellRenderer = memo(
    forwardRef(
        (
            params: ICellRendererParams<ReturnType<ReturnType<typeof pnlCellValueGetterFactory>>>,
            ref: ForwardedRef<HTMLElement>,
        ): null | ReactElement => {
            if (isNil(params.value)) return null;

            const fullValue = formatUsd(params.value.payload);
            const title = params.value.data.isApproximateProfit ? (
                <>
                    <p>{fullValue}</p>
                    <p>
                        Profit calculation is approximate as some assets are missing start or end
                        price
                    </p>
                </>
            ) : (
                fullValue
            );

            const colorizer = (
                <NumberColorizerRenderer
                    ref={ref}
                    value={params.value.payload}
                    valueFormatted={params.valueFormatted}
                />
            );

            if (fullValue !== params.valueFormatted) {
                return (
                    <Tooltip trigger="click" title={title}>
                        {colorizer}
                    </Tooltip>
                );
            }

            return (
                <Tooltip trigger="hover" title={title}>
                    {colorizer}
                </Tooltip>
            );
        },
    ),
);
