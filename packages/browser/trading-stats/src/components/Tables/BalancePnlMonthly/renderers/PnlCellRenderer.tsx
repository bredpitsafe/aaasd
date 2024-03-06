import { NumberColorizerRenderer } from '@frontend/common/src/components/AgTable/renderers/NumberColorizerRenderer';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { formatUsd } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { ICellRendererParams } from 'ag-grid-community';
import { ForwardedRef, forwardRef, memo, ReactElement } from 'react';

import { TBalancePnlMonthly } from '../types';

export const PnlCellRenderer = memo(
    forwardRef(
        (
            params: ICellRendererParams<TBalancePnlMonthly>,
            ref: ForwardedRef<HTMLElement>,
        ): ReactElement => {
            const fullValue = formatUsd(params.value);
            const title = params.data?.isApproximateProfit ? (
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
                    value={params.value}
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
