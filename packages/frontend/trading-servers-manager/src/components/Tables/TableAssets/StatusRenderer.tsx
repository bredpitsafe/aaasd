import type { TAssetApprovalStatus } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ICellRendererParams } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { ApprovalStatus } from '../ApprovalStatus.tsx';

export const StatusRenderer = memo(({ value }: ICellRendererParams<TAssetApprovalStatus>) => {
    if (isNil(value)) {
        return null;
    }

    return <ApprovalStatus approvalStatus={value} />;
});
