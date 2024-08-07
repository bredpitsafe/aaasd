import type { ICellRendererParams } from '@frontend/ag-grid';
import { NumberColorizerRenderer } from '@frontend/common/src/components/AgTable/renderers/NumberColorizerRenderer';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo } from 'react';

import type { TBalancePnlDailyAsset } from '../types';

export const ApproximateDeltaUsdRenderer = memo(
    (
        params: ICellRendererParams<TBalancePnlDailyAsset['deltaUsd'], TBalancePnlDailyAsset>,
    ): ReactElement => {
        const value = params.value;
        const isApproximate = params.data?.isDeltaUsdApproximate;
        const content = (
            <NumberColorizerRenderer value={value} valueFormatted={params.valueFormatted} />
        );
        const isValueApproximate = !isNil(value) && isApproximate;
        const isGroupApproximate =
            params.node.group === true &&
            !isNil(value) &&
            params.node.aggData.isDeltaUsdApproximate === true;

        if (isValueApproximate || isGroupApproximate) {
            return (
                <Tooltip
                    title={
                        isValueApproximate
                            ? 'Δ USD calculation is approximate as the asset is missing start or end price'
                            : 'Δ USD calculation is approximate as one or more assets are missing start or end price'
                    }
                >
                    {content} *
                </Tooltip>
            );
        }

        return content;
    },
);
