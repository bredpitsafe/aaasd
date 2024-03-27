import { ICellRendererParams } from '@frontend/ag-grid';
import { NumberColorizerRenderer } from '@frontend/common/src/components/AgTable/renderers/NumberColorizerRenderer';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { isNil } from 'lodash-es';
import { memo, ReactElement } from 'react';

import { TBalancePnlDailyAsset } from '../types';

export const ApproximateDeltaUsdRenderer = memo(
    (
        params: ICellRendererParams<TBalancePnlDailyAsset['deltaUsd'], TBalancePnlDailyAsset>,
    ): ReactElement => {
        const value = params.value;
        const isApproximate = params.data?.isDeltaUsdApproximate;
        const content = (
            <NumberColorizerRenderer value={value} valueFormatted={params.valueFormatted} />
        );
        const isValueApproximate = !isNil(params.value) && isApproximate;
        const isGroupApproximate =
            params.node.group === true && params.node.aggData.isDeltaUsdApproximate === true;

        if (isValueApproximate || isGroupApproximate) {
            return (
                <Tooltip
                    title={
                        'Δ USD calculation is approximate as the asset is missing start or end price'
                    }
                >
                    {content} *
                </Tooltip>
            );
        }

        return content;
    },
);
