import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { sprintf } from '@frontend/common/src/utils/sprintf/sprintf';
import { ICellRendererParams } from 'ag-grid-community';
import { memo, ReactElement } from 'react';

import { TArbStatsDailyAsset } from '../types';

const FEE_FORMAT = '%.2f %s';
export const FeesRenderer = memo(
    (params: ICellRendererParams<TArbStatsDailyAsset>): ReactElement | null => {
        if (params.data?.fees?.length !== undefined && params.data.fees.length > 1) {
            const currencyFees = params.data.fees.map((fee) => (
                <div key={fee.assetName}>{sprintf(FEE_FORMAT, fee.value, fee.assetName)}</div>
            ));

            return <Tooltip title={currencyFees}>{params.valueFormatted}</Tooltip>;
        }

        return <>{params.valueFormatted}</>;
    },
);
