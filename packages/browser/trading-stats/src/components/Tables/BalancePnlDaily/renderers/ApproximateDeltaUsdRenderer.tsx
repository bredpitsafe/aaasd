import { NumberColorizerRenderer } from '@frontend/common/src/components/AgTable/renderers/NumberColorizerRenderer';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { ICellRendererParams } from 'ag-grid-community';
import { isNil } from 'lodash-es';
import { memo, ReactElement } from 'react';

import { TBalancePnlDailyAsset } from '../types';

export const ApproximateDeltaUsdRenderer = memo(
    (params: ICellRendererParams<TBalancePnlDailyAsset>): ReactElement => {
        const content = <NumberColorizerRenderer {...params} />;
        const isValueApproximate = !isNil(params.value) && params.data?.isDeltaUsdApproximate;
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
